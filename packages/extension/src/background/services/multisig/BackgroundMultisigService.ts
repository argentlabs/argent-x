import {
  addOwnersCalldataSchema,
  changeThresholdCalldataSchema,
  decodeBase58,
  decodeBase58Array,
  estimatedFeeToMaxResourceBounds,
  isEqualAddress,
  removeOwnersCalldataSchema,
  replaceSignerCalldataSchema,
  transferCalldataSchema,
} from "@argent/x-shared"
import type { ArraySignatureType } from "starknet"
import { CallData, TransactionType } from "starknet"
import { tryToMintAllFeeTokens } from "../../../shared/devnet/mintFeeToken"
import { AccountError } from "../../../shared/errors/account"
import { MultisigError } from "../../../shared/errors/multisig"
import { TransactionError } from "../../../shared/errors/transaction"
import { MultisigAccount } from "../../../shared/multisig/account"
import type {
  AddAccountPayload,
  AddOwnerMultisigPayload,
  MultisigSignerSignatures,
  RemoveOwnerMultisigPayload,
  ReplaceOwnerMultisigPayload,
  UpdateMultisigThresholdPayload,
} from "../../../shared/multisig/multisig.model"
import { getMultisigPendingOffchainSignature } from "../../../shared/multisig/pendingOffchainSignaturesStore"
import {
  addPendingMultisigApproval,
  getMultisigPendingTransaction,
  removeFromMultisigPendingTransactions,
} from "../../../shared/multisig/pendingTransactionsStore"
import type { AddAccountResponse } from "../../../shared/multisig/service/messaging/IMultisigService"
import type { PendingMultisig } from "../../../shared/multisig/types"
import {
  MultisigEntryPointType,
  MultisigTransactionType,
} from "../../../shared/multisig/types"
import {
  getMultisigAccountFromBaseWallet,
  getMultisigAccounts,
} from "../../../shared/multisig/utils/baseMultisig"
import { ETH_TOKEN_ADDRESS } from "../../../shared/network/constants"
import type {
  ExtendedFinalityStatus,
  TransactionRequest,
} from "../../../shared/transactions"
import { nameTransaction } from "../../../shared/transactions"
import { addTransaction } from "../../../shared/transactions/store"
import { getEstimatedFees } from "../../../shared/transactionSimulation/fees/estimatedFeesRepository"
import type {
  BaseWalletAccount,
  SignerType,
} from "../../../shared/wallet.model"
import { hexBigIntSort } from "../../utils/bigIntSort"
import type { Wallet } from "../../wallet"
import type { IBackgroundActionService } from "../action/IBackgroundActionService"
import type { IBackgroundMultisigService } from "./IBackgroundMultisigService"

export default class BackgroundMultisigService
  implements IBackgroundMultisigService
{
  constructor(
    private wallet: Wallet,
    private actionService: IBackgroundActionService,
  ) {}

  async addAccount(payload: AddAccountPayload): Promise<AddAccountResponse> {
    const {
      networkId,
      signers,
      threshold,
      creator,
      publicKey,
      updatedAt,
      signerType,
      index,
      derivationPath,
    } = payload

    const account = await this.wallet.newAccount(
      networkId,
      "multisig",
      signerType,
      {
        signers,
        threshold,
        creator,
        publicKey,
        updatedAt,
        index,
        derivationPath,
      },
    )
    await tryToMintAllFeeTokens(account)

    const accounts = await getMultisigAccounts()

    return {
      account,
      accounts,
    }
  }

  async addOwner(payload: AddOwnerMultisigPayload): Promise<void> {
    const { address, signersToAdd, newThreshold } = payload

    const signersPayload = {
      entrypoint: MultisigEntryPointType.ADD_SIGNERS,
      calldata: CallData.compile(
        addOwnersCalldataSchema.parse({
          new_threshold: newThreshold.toString(),
          signers_to_add: decodeBase58Array(signersToAdd),
        }),
      ),
      contractAddress: address,
    }
    const title = `Add owner${
      signersToAdd.length > 1 ? "s" : ""
    } and set confirmations to ${newThreshold}`
    await this.actionService.add(
      {
        type: "TRANSACTION",
        payload: {
          transactions: signersPayload,
          meta: {
            title: "Add signers",
            type: MultisigTransactionType.MULTISIG_ADD_SIGNERS,
            ampliProperties: {
              "is deployment": false,
              "transaction type": "add owner",
              "account type": "multisig",
              "wallet platform": "browser extension",
            },
          },
        },
      },
      {
        title,
        icon: "AddContactSecondaryIcon",
      },
    )
  }

  async removeOwner(payload: RemoveOwnerMultisigPayload): Promise<void> {
    const { address, signerToRemove, newThreshold } = payload

    const signersToRemove = [decodeBase58(signerToRemove)]

    const signersPayload = {
      entrypoint: MultisigEntryPointType.REMOVE_SIGNERS,
      calldata: CallData.compile(
        removeOwnersCalldataSchema.parse({
          new_threshold: newThreshold.toString(),
          signers_to_remove: signersToRemove,
        }),
      ),

      contractAddress: address,
    }
    const title = `Remove owner${
      signersToRemove.length > 1 ? "s" : ""
    } and set confirmations to ${newThreshold}`
    await this.actionService.add(
      {
        type: "TRANSACTION",
        payload: {
          transactions: signersPayload,
          meta: {
            type: MultisigTransactionType.MULTISIG_REMOVE_SIGNERS,
            ampliProperties: {
              "is deployment": false,
              "transaction type": "remove owner",
              "account type": "multisig",
              "wallet platform": "browser extension",
            },
          },
        },
      },
      {
        title,
        icon: "RemoveContactSecondaryIcon",
      },
    )
  }

  async replaceOwner(payload: ReplaceOwnerMultisigPayload): Promise<void> {
    const { signerToRemove, signerToAdd, address } = payload

    const decodedSignerToRemove = decodeBase58(signerToRemove)
    const decodedSignerToAdd = decodeBase58(signerToAdd)

    const signersPayload = {
      entrypoint: MultisigEntryPointType.REPLACE_SIGNER,
      calldata: CallData.compile(
        replaceSignerCalldataSchema.parse({
          signer_to_remove: decodedSignerToRemove,
          signer_to_add: decodedSignerToAdd,
        }),
      ),
      contractAddress: address,
    }

    await this.actionService.add(
      {
        type: "TRANSACTION",
        payload: {
          transactions: signersPayload,
          meta: {
            type: MultisigTransactionType.MULTISIG_REPLACE_SIGNER,
            ampliProperties: {
              "is deployment": false,
              "transaction type": "replace owner",
              "account type": "multisig",
              "wallet platform": "browser extension",
            },
          },
        },
      },
      {
        title: "Replace owner",
        icon: "MultisigReplaceIcon",
      },
    )
  }

  async addPendingAccount(
    networkId: string,
    signerType: SignerType,
  ): Promise<PendingMultisig> {
    return await this.wallet.newPendingMultisig(networkId, signerType)
  }

  async addTransactionSignature(
    requestId: string,
    pubKey?: string,
  ): Promise<string> {
    const multisigStarknetAccount = await this.getMultisigStarknetAccount()
    const transactionToSign = await getMultisigPendingTransaction(requestId)
    if (!transactionToSign) {
      throw new MultisigError({
        code: "PENDING_MULTISIG_TRANSACTION_NOT_FOUND",
        message: `Pending Multisig transaction ${requestId} not found`,
      })
    }

    const { transaction_hash } =
      await multisigStarknetAccount.addTransactionSignature(transactionToSign)

    await addPendingMultisigApproval(requestId, pubKey)

    return transaction_hash
  }

  async addOffchainSignature(
    requestId: string,
  ): Promise<MultisigSignerSignatures> {
    const multisigStarknetAccount = await this.getMultisigStarknetAccount()
    const pendingSignature = await this.getPendingOffchainSignature(requestId)

    return multisigStarknetAccount.addOffchainSignature(pendingSignature)
  }

  async waitForOffchainSignatures(
    requestId: string,
  ): Promise<ArraySignatureType> {
    const multisigStarknetAccount = await this.getMultisigStarknetAccount()
    const pendingSignature = await this.getPendingOffchainSignature(requestId)
    const signerSignatures =
      await multisigStarknetAccount.waitForOffchainSignatures(pendingSignature)

    // Sort the signatures by signer in ascending order
    const sortedSignatures = signerSignatures.sort((a, b) =>
      hexBigIntSort(a.signer, b.signer),
    )

    // Final signature format: [signer1, r1, s1, signer2, r2, s2, ...]
    return sortedSignatures.reduce<ArraySignatureType>(
      (acc, { signer, signature }) => [
        ...acc,
        signer,
        signature.r,
        signature.s,
      ],
      [],
    )
  }

  async cancelOffchainSignature(requestId: string): Promise<void> {
    const multisigStarknetAccount = await this.getMultisigStarknetAccount()
    const pendingSignature = await this.getPendingOffchainSignature(requestId)
    await multisigStarknetAccount.cancelOffchainSignature(pendingSignature)
  }

  async deploy(account: BaseWalletAccount): Promise<void> {
    let displayCalldata: string[] = []
    const walletAccount = await this.wallet.getArgentAccount(account.id)
    if (!walletAccount) {
      throw new AccountError({ code: "MULTISIG_NOT_FOUND" })
    }
    try {
      /** determine the calldata to display to the end user */
      const deployAccountPayload =
        await this.wallet.getMultisigDeploymentPayload(walletAccount)
      const { constructorCalldata } = deployAccountPayload
      displayCalldata = CallData.toCalldata(constructorCalldata)
    } catch {
      /** ignore non-critical error */
    }

    await this.actionService.add(
      {
        type: "DEPLOY_MULTISIG",
        payload: {
          account,
          displayCalldata,
          meta: {
            ampliProperties: {
              "is deployment": true,
              "transaction type": "deploy contract",
              "account type": "multisig",
              "wallet platform": "browser extension",
            },
          },
        },
      },
      {
        title: "Activate multisig",
        icon: "MultisigSecondaryIcon",
      },
    )
  }

  async updateThreshold(
    payload: UpdateMultisigThresholdPayload,
  ): Promise<void> {
    const { address, newThreshold } = payload

    const thresholdPayload = {
      entrypoint: MultisigEntryPointType.CHANGE_THRESHOLD,
      calldata: changeThresholdCalldataSchema.parse([newThreshold.toString()]),
      contractAddress: address,
    }

    await this.actionService.add(
      {
        type: "TRANSACTION",
        payload: {
          transactions: thresholdPayload,
          meta: {
            type: MultisigTransactionType.MULTISIG_CHANGE_THRESHOLD,
            ampliProperties: {
              "is deployment": false,
              "transaction type": "set confirmation",
              "account type": "multisig",
              "wallet platform": "browser extension",
            },
          },
        },
      },
      {
        title: `Set confirmations to ${newThreshold}`,
        icon: "ApproveIcon",
      },
    )
  }

  async rejectOnChainTransaction(requestId: string): Promise<void> {
    const multisigStarknetAccount = await this.getMultisigStarknetAccount()
    const transactionToSign = await getMultisigPendingTransaction(requestId)

    if (!transactionToSign) {
      throw new MultisigError({
        code: "PENDING_MULTISIG_TRANSACTION_NOT_FOUND",
        message: `Pending Multisig transaction ${requestId} not found`,
      })
    }

    const calldata = transferCalldataSchema.parse({
      recipient: multisigStarknetAccount.address,
      amount: {
        low: 0,
        high: 0,
      },
    })

    const rejectTxPayload = {
      entrypoint: "transfer",
      calldata: CallData.toCalldata(calldata),
      contractAddress: ETH_TOKEN_ADDRESS,
    }

    await this.actionService.add(
      {
        type: "TRANSACTION",
        payload: {
          transactions: rejectTxPayload,
          meta: {
            title: "On-chain rejection",
            subTitle: "",
            type: MultisigTransactionType.MULTISIG_REJECT_ON_CHAIN,
            ampliProperties: {
              "is deployment": false,
              "transaction type": "reject onchain",
              "account type": "multisig",
              "wallet platform": "browser extension",
            },
          },
          transactionsDetail: {
            nonce: transactionToSign.nonce,
          },
        },
      },
      {
        title: "On-chain rejection",
        icon: "CrossSecondaryIcon",
      },
    )
  }

  private async getMultisigStarknetAccount(): Promise<MultisigAccount> {
    const selectedAccount = await this.wallet.getSelectedAccount()

    if (!selectedAccount) {
      throw new AccountError({ code: "NOT_SELECTED" })
    }

    const multisigStarknetAccount = await this.wallet.getStarknetAccount(
      selectedAccount.id,
    )

    if (!MultisigAccount.isMultisig(multisigStarknetAccount)) {
      throw new AccountError({ code: "NOT_MULTISIG" })
    }

    return multisigStarknetAccount
  }

  private async getPendingOffchainSignature(requestId: string) {
    const pendingSignature =
      await getMultisigPendingOffchainSignature(requestId)

    if (!pendingSignature) {
      throw new MultisigError({
        code: "PENDING_MULTISIG_OFFCHAIN_SIGNATURE_NOT_FOUND",
        message: `Pending Multisig Offchain signature ${requestId} not found`,
      })
    }

    return pendingSignature
  }

  async retryTransactionExecution(
    requestId: string,
  ): Promise<{ hash: string }> {
    const pendingMultisigTransaction =
      await getMultisigPendingTransaction(requestId)
    if (!pendingMultisigTransaction) {
      throw new MultisigError({
        code: "PENDING_MULTISIG_TRANSACTION_NOT_FOUND",
        message: `Pending Multisig transaction ${requestId} not found`,
      })
    }

    const preComputedFees = await getEstimatedFees({
      type: TransactionType.INVOKE,
      payload: pendingMultisigTransaction.transaction.calls,
    })

    if (!preComputedFees) {
      throw new TransactionError({ code: "NO_PRE_COMPUTED_FEES" })
    }

    const selectedAccount = await this.wallet.getSelectedAccount()

    if (!selectedAccount) {
      throw new AccountError({ code: "NOT_FOUND" })
    }
    const multisig = await getMultisigAccountFromBaseWallet(selectedAccount)

    const acc = await this.getMultisigStarknetAccount()

    // this can happen if the multisig owner was changed with ledger after the transaction was created
    if (
      !pendingMultisigTransaction.approvedSigners.find((signer) =>
        isEqualAddress(signer, multisig?.publicKey),
      )
    ) {
      throw new MultisigError({
        code: "INVALID_SIGNER",
        message:
          "The signature of the transaction is not valid anymore - please reject this transaction and try again",
      })
    }

    const transaction = await acc.execute(
      pendingMultisigTransaction.transaction.calls,
      {
        nonce: pendingMultisigTransaction.nonce,
        version: pendingMultisigTransaction.transaction.version,
        ...estimatedFeeToMaxResourceBounds(preComputedFees.transactions),
      },
    )

    //remove exiting pending transaction. the new one was added in the .execute() call
    await removeFromMultisigPendingTransactions([pendingMultisigTransaction])

    const title = nameTransaction(pendingMultisigTransaction.transaction.calls)

    const finalityStatus: ExtendedFinalityStatus =
      multisig && multisig.threshold > 1 ? "NOT_RECEIVED" : "RECEIVED"

    const tx: TransactionRequest = {
      hash: transaction.transaction_hash,
      account: selectedAccount,
      meta: {
        ...pendingMultisigTransaction.meta,
        title,
        transactions: pendingMultisigTransaction.transaction.calls,
        type: pendingMultisigTransaction.type ?? "INVOKE",
      },
    }
    await addTransaction(tx, { finality_status: finalityStatus })

    return tx
  }
}
