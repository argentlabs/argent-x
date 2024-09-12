import {
  estimatedFeeToMaxResourceBounds,
  getTxVersionFromFeeToken,
} from "@argent/x-shared"
import { TransactionType, num } from "starknet"
import {
  ExtQueueItem,
  TransactionActionPayload,
} from "../../shared/actionQueue/types"
import { AccountError } from "../../shared/errors/account"
import { SessionError } from "../../shared/errors/session"
import { TransactionError } from "../../shared/errors/transaction"
import { getMultisigAccountFromBaseWallet } from "../../shared/multisig/utils/baseMultisig"
import { getEstimatedFees } from "../../shared/transactionSimulation/fees/estimatedFeesRepository"
import {
  ExtendedFinalityStatus,
  TransactionRequest,
  nameTransaction,
} from "../../shared/transactions"
import {
  addTransaction,
  transactionsStore,
} from "../../shared/transactions/store"
import {
  checkTransactionHash,
  getTransactionStatus,
} from "../../shared/transactions/utils"
import { accountsEqual } from "../../shared/utils/accountsEqual"
import { isSafeUpgradeTransaction } from "../../shared/utils/isSafeUpgradeTransaction"
import { isAccountDeployed } from "../accountDeploy"
import { getNonce, increaseStoredNonce } from "../nonce"
import { Wallet } from "../wallet"

export type TransactionAction = ExtQueueItem<{
  type: "TRANSACTION"
  payload: TransactionActionPayload
}>

export const executeTransactionAction = async (
  action: TransactionAction,
  wallet: Wallet,
) => {
  const { transactions, abis, transactionsDetail, meta = {} } = action.payload
  const allTransactions = await transactionsStore.get()
  const preComputedFees = await getEstimatedFees({
    type: TransactionType.INVOKE,
    payload: transactions,
  })

  if (!preComputedFees) {
    throw new TransactionError({ code: "NO_PRE_COMPUTED_FEES" })
  }

  if (!(await wallet.isSessionOpen())) {
    throw new SessionError({ code: "NO_OPEN_SESSION" })
  }
  const selectedAccount = await wallet.getSelectedAccount()

  if (!selectedAccount) {
    throw new AccountError({ code: "NOT_FOUND" })
  }

  const multisig =
    selectedAccount.type === "multisig"
      ? await getMultisigAccountFromBaseWallet(selectedAccount)
      : undefined

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

  const starknetAccount = await wallet.getStarknetAccount(
    selectedAccount,
    hasUpgradePending,
  )

  const accountNeedsDeploy = !(await isAccountDeployed(
    selectedAccount,
    starknetAccount.getClassAt.bind(starknetAccount),
  ))

  // if nonce doesnt get provided by the UI, we can use the stored nonce to allow transaction queueing
  const nonceWasProvidedByUI = transactionsDetail?.nonce !== undefined // nonce can be a number of 0 therefore we need to check for undefined
  const nonce = accountNeedsDeploy
    ? num.toHex(1)
    : nonceWasProvidedByUI
      ? num.toHex(transactionsDetail?.nonce || 0)
      : await getNonce(selectedAccount, starknetAccount)

  const version = getTxVersionFromFeeToken(
    preComputedFees.transactions.feeTokenAddress,
  )

  if (accountNeedsDeploy && preComputedFees.deployment) {
    const { account, txHash } = await wallet.deployAccount(selectedAccount, {
      version,
      ...estimatedFeeToMaxResourceBounds(preComputedFees.deployment),
    })
    if (!checkTransactionHash(txHash)) {
      throw Error(
        "Deploy Account Transaction could not get added to the sequencer",
      )
    }

    await addTransaction({
      hash: txHash,
      account,
      meta: {
        ...meta,
        title: "Activate Account",
        isDeployAccount: true,
        type: "DEPLOY_ACCOUNT",
      },
    })
  }

  const signer = await wallet.getSignerForAccount(selectedAccount)

  const acc = wallet.getStarknetAccountOfType(
    starknetAccount,
    signer,
    selectedAccount,
  )

  if (!("transactionVersion" in acc)) {
    throw new Error("Old Accounts are not supported anymore")
  }

  const transaction = await acc.execute(transactions, abis, {
    ...transactionsDetail,
    nonce,
    version,
    ...estimatedFeeToMaxResourceBounds(preComputedFees.transactions),
  })

  if (!checkTransactionHash(transaction.transaction_hash, selectedAccount)) {
    throw new Error("Transaction could not get added to the sequencer")
  }

  const title = nameTransaction(transactions)

  const finalityStatus: ExtendedFinalityStatus =
    multisig && multisig.threshold > 1 ? "NOT_RECEIVED" : "RECEIVED"

  const tx: TransactionRequest = {
    hash: transaction.transaction_hash,
    account: selectedAccount,
    meta: {
      ...meta,
      title,
      transactions,
      type: meta.type ?? "INVOKE",
    },
  }

  // Add transaction with finality status NOT_RECEIVED for multisig transactions with threshold > 1
  await addTransaction(tx, { finality_status: finalityStatus })

  // This will not execute for multisig transactions
  if (!nonceWasProvidedByUI && finalityStatus === "RECEIVED") {
    await increaseStoredNonce(selectedAccount)
  }

  return transaction
}
