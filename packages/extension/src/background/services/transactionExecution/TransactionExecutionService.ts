import type { ExtendedFinalityStatus } from "../../../shared/transactions"
import {
  nameTransaction,
  type ExtendedTransactionStatus,
  type Transaction,
  type TransactionMeta,
  type TransactionRequest,
} from "../../../shared/transactions"
import type { Wallet } from "../../wallet"
import type { IBackgroundInvestmentService } from "../investments/IBackgroundInvestmentService"
import { type ITransactionsRepository } from "../../../shared/transactions/store"
import type { IEstimatedFeesRepository } from "../../../shared/transactionSimulation/fees/fees.model"
import { getEstimatedFees } from "../../../shared/transactionSimulation/fees/estimatedFeesRepository"
import type { AllowArray, Call, InvocationsDetails, Signature } from "starknet"
import { CallData, num, TransactionType } from "starknet"
import { TransactionError } from "../../../shared/errors/transaction"
import { AccountError } from "../../../shared/errors/account"
import { SessionError } from "../../../shared/errors/session"
import type {
  NativeEstimatedFee,
  NativeEstimatedFees,
  PaymasterEstimatedFees,
} from "@argent/x-shared/simulation"
import type { WalletAccount } from "../../../shared/wallet.model"
import type { Address, StrictOmit } from "@argent/x-shared"
import {
  argentNetworkIdSchema,
  ensureArray,
  estimatedFeesToMaxFeeTotalV2,
  estimatedFeeToMaxResourceBounds,
  getTxVersionFromFeeToken,
} from "@argent/x-shared"
import type { BaseStarknetAccount } from "../../../shared/starknetAccount/base"
import { isSafeUpgradeTransaction } from "../../../shared/utils/isSafeUpgradeTransaction"
import { accountsEqual } from "../../../shared/utils/accountsEqual"
import {
  checkTransactionHash,
  getTransactionStatus,
} from "../../../shared/transactions/utils"
import { isAccountDeployed } from "../../accountDeploy"
import type { INonceManagementService } from "../../nonceManagement/INonceManagementService"
import {
  isArgentAccount,
  walletAccountToArgentAccount,
} from "../../../shared/utils/isExternalAccount"
import { getMultisigAccountFromBaseWallet } from "../../../shared/multisig/utils/baseMultisig"
import type { TransactionActionPayload } from "../../../shared/actionQueue/types"
import type { ITransactionExecutionService } from "./ITransactionExecutionService"
import type { IPaymasterService } from "@argent/x-shared/paymaster"
import {
  guardianSignerNotRequired,
  guardianSignerNotRequiredSelectors,
} from "../../../shared/signer/GuardianSignerV2"
import type { SmartAccount } from "../../../shared/smartAccount/account"

export class TransactionExecutionService
  implements ITransactionExecutionService
{
  constructor(
    private readonly wallet: Wallet,
    private readonly paymasterService: IPaymasterService,
    private readonly investmentService: IBackgroundInvestmentService,
    private readonly nonceManagementService: INonceManagementService,
    private readonly transactionsRepo: ITransactionsRepository,
    private readonly estimatedFeesRepo: IEstimatedFeesRepository,
  ) {}

  async execute({
    transactions,
    transactionsDetail = {},
    meta = {},
  }: TransactionActionPayload) {
    if (!(await this.wallet.isSessionOpen())) {
      throw new SessionError({ code: "NO_OPEN_SESSION" })
    }

    const selectedAccount = await this.wallet.getSelectedAccount()
    if (!selectedAccount) {
      throw new AccountError({ code: "NOT_FOUND" })
    }

    const allTransactions = await this.transactionsRepo.get()
    const { isSubsidised, ...preComputedFees } =
      await this.getPreComputedFees(transactions)

    const pendingAccountTransactions = allTransactions.filter((tx) => {
      const { finality_status } = getTransactionStatus(tx)
      return (
        finality_status === "RECEIVED" &&
        accountsEqual(tx.account, selectedAccount)
      )
    })

    const hasUpgradePending = pendingAccountTransactions.some(
      isSafeUpgradeTransaction,
    )

    const starknetAccount = await this.wallet.getStarknetAccount(
      selectedAccount.id,
      hasUpgradePending,
    )

    const accountNeedsDeploy = !(await isAccountDeployed(
      selectedAccount,
      starknetAccount.getClassAt.bind(starknetAccount),
    ))

    let transactionHash
    if (preComputedFees.type === "paymaster") {
      transactionHash = await this.executeWithPaymaster(
        selectedAccount,
        starknetAccount,
        transactions,
        preComputedFees,
        accountNeedsDeploy,
        isSubsidised,
      )
    } else if (preComputedFees.type === "native") {
      transactionHash = await this.executeOnchain(
        selectedAccount,
        starknetAccount,
        transactions,
        preComputedFees,
        accountNeedsDeploy,
        transactionsDetail,
        meta,
      )
    } else {
      throw new TransactionError({ code: "INVALID_FEE_TYPE" })
    }

    if (!checkTransactionHash(transactionHash, selectedAccount)) {
      throw new Error("Transaction could not get added to the sequencer")
    }
    const title = nameTransaction(transactions)

    const multisig =
      selectedAccount.type === "multisig"
        ? await getMultisigAccountFromBaseWallet(selectedAccount)
        : undefined

    const finalityStatus: ExtendedFinalityStatus =
      multisig && multisig.threshold > 1 ? "NOT_RECEIVED" : "RECEIVED"

    const tx: TransactionRequest = {
      hash: transactionHash,
      account: selectedAccount,
      meta: {
        ...meta,
        title,
        transactions,
        type: meta.type ?? "INVOKE",
      },
    }

    // This will not execute for multisig transactions
    if (
      transactionsDetail?.nonce !== undefined &&
      finalityStatus === "RECEIVED"
    ) {
      await this.nonceManagementService.increaseLocalNonce(selectedAccount.id)
    }

    await this.addTransaction(tx, { finality_status: finalityStatus })

    // Post transaction actions
    await this.handleInvestmentTransaction(
      selectedAccount,
      meta,
      transactionHash,
    )

    // Return the transaction hash
    return transactionHash
  }

  async executeWithPaymaster(
    account: WalletAccount,
    starknetAccount: BaseStarknetAccount,
    transactions: AllowArray<Call>,
    fees: PaymasterEstimatedFees,
    accountNeedsDeploy = false,
    isSubsidised?: boolean,
  ) {
    const feeTokenAddress = fees.transactions.feeTokenAddress
    const maxFee = estimatedFeesToMaxFeeTotalV2(fees)
    const calls = ensureArray(transactions)

    const accountClassHash = accountNeedsDeploy ? account.classHash : undefined

    const typedData = await this.paymasterService.getExecutionData(
      {
        calls,
        accountAddress: account.address as Address,
        networkId: argentNetworkIdSchema.parse(account.networkId),
        feeTokenAddress,
        maxFee,
        accountClassHash,
      },
      { isSubsidised },
    )

    const deploymentData = accountNeedsDeploy
      ? await this.getPaymasterDeploymentData(account)
      : undefined

    let signature: Signature
    if (account.type === "smart") {
      const shouldSkipCosign = calls.some(
        (call) =>
          guardianSignerNotRequiredSelectors.includes(call.entrypoint) ||
          guardianSignerNotRequired.includes(call.entrypoint),
      )
      signature = await (starknetAccount as SmartAccount).signMessage(
        typedData,
        shouldSkipCosign,
      )
    } else {
      signature = await starknetAccount.signMessage(typedData)
    }

    if (!Array.isArray(signature)) {
      throw new TransactionError({ code: "INVALID_PAYMASTER_SIGNATURE" })
    }

    const transactionHash = await this.paymasterService.execute(
      {
        signature: signature.map(num.toHex), // Avnu expects hex values
        accountAddress: account.address as Address,
        networkId: argentNetworkIdSchema.parse(account.networkId),
        typedData,
        deploymentData,
      },
      { isSubsidised },
    )

    return transactionHash
  }

  async executeOnchain(
    account: WalletAccount,
    starknetAccount: BaseStarknetAccount,
    transactions: AllowArray<Call>,
    fees: NativeEstimatedFees,
    accountNeedsDeploy = false,
    transactionsDetail: InvocationsDetails,
    meta: TransactionMeta,
  ) {
    const nonce = accountNeedsDeploy
      ? num.toHex(1)
      : transactionsDetail?.nonce !== undefined
        ? num.toHex(transactionsDetail.nonce)
        : await this.nonceManagementService.getNonce(account.id)

    const version = getTxVersionFromFeeToken(fees.transactions.feeTokenAddress)

    const txDetails = {
      ...transactionsDetail,
      ...estimatedFeeToMaxResourceBounds(fees.transactions),
      nonce,
      version,
    }

    await this.tryAccountDeployment(
      account,
      accountNeedsDeploy,
      fees.deployment,
      meta,
    )

    const transaction = await starknetAccount.execute(transactions, txDetails)

    return transaction.transaction_hash
  }

  async tryAccountDeployment(
    account: WalletAccount,
    needsDeploy: boolean,
    deploymentFee: StrictOmit<NativeEstimatedFee, "type"> | undefined,
    meta: TransactionMeta,
  ) {
    if (isArgentAccount(account) && needsDeploy && deploymentFee) {
      const version = getTxVersionFromFeeToken(deploymentFee.feeTokenAddress)
      const deployDetails = {
        version,
        ...estimatedFeeToMaxResourceBounds(deploymentFee),
      }

      const { account: deployedAccount, txHash } =
        await this.wallet.deployAccount(account, deployDetails)

      if (!checkTransactionHash(txHash)) {
        throw Error(
          "Deploy Account Transaction could not get added to the sequencer",
        )
      }

      await this.addTransaction({
        hash: txHash,
        account: deployedAccount,
        meta: {
          ...meta,
          title: "Activate Account",
          isDeployAccount: true,
          type: "DEPLOY_ACCOUNT",
        },
      })
    }
  }

  async getPaymasterDeploymentData(account: WalletAccount) {
    const deploymentData = await this.wallet.getAccountDeploymentPayload(
      walletAccountToArgentAccount(account),
    )
    const { addressSalt, constructorCalldata, classHash } = deploymentData
    return {
      class_hash: classHash,
      calldata: CallData.toCalldata(constructorCalldata),
      salt: num.toHex(addressSalt),
      unique: "0x0",
    }
  }

  public async getPreComputedFees(transactions: AllowArray<Call>) {
    const preComputedFees = await getEstimatedFees(
      { type: TransactionType.INVOKE, payload: transactions },
      this.estimatedFeesRepo,
    )
    if (!preComputedFees) {
      throw new TransactionError({ code: "NO_PRE_COMPUTED_FEES" })
    }
    return preComputedFees
  }

  async handleInvestmentTransaction(
    account: WalletAccount,
    meta: TransactionMeta,
    txHash: string,
  ) {
    if (!meta.investment?.investmentId || !account || !txHash) {
      return
    }

    const data = {
      action: meta.investment.stakingAction,
      accountAddress: account.address as Address,
      transactionHash: txHash,
      subsequentTransaction: meta.investment.subsequentTransaction,
      assets: [
        {
          amount: meta.investment.amount,
          tokenAddress: meta.investment.tokenAddress,
          useFullBalance: meta.investment.useFullBalance,
        },
      ],
    }

    await this.investmentService.notifySubmittedInvestment(
      meta.investment.investmentId,
      data,
    )
  }

  private addTransaction(
    transaction: TransactionRequest,
    status?: ExtendedTransactionStatus,
  ) {
    // sanity checks
    if (!checkTransactionHash(transaction.hash)) {
      return // dont throw
    }

    const defaultStatus: ExtendedTransactionStatus = {
      finality_status: "RECEIVED",
    }

    const newTransaction: Transaction = {
      status: status ?? defaultStatus,
      timestamp: Math.floor(Date.now() / 1000), // Time in seconds
      ...transaction,
    }

    return this.transactionsRepo.upsert(newTransaction)
  }
}
