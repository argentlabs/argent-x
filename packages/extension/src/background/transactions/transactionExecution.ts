import { num } from "starknet"
import {
  ExtQueueItem,
  TransactionActionPayload,
} from "../../shared/actionQueue/types"
import {
  ExtendedFinalityStatus,
  TransactionRequest,
  nameTransaction,
} from "../../shared/transactions"
import { accountsEqual } from "../../shared/utils/accountsEqual"
import { isAccountDeployed } from "../accountDeploy"
import { analytics } from "../analytics"
import { getNonce, increaseStoredNonce, resetStoredNonce } from "../nonce"
import { Wallet } from "../wallet"
import { getEstimatedFees } from "../../shared/transactionSimulation/fees/estimatedFeesRepository"
import {
  addTransaction,
  transactionsStore,
} from "../../shared/transactions/store"
import { getMultisigAccountFromBaseWallet } from "../../shared/multisig/utils/baseMultisig"
import {
  checkTransactionHash,
  getTransactionStatus,
} from "../../shared/transactions/utils"
import { isAccountV5 } from "@argent/shared"
import { estimatedFeeToMaxFeeTotal } from "../../shared/transactionSimulation/utils"

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
  const preComputedFees = await getEstimatedFees(transactions)

  if (!preComputedFees) {
    throw Error("PreComputedFees not defined")
  }

  const suggestedMaxFee =
    transactionsDetail?.maxFee ??
    estimatedFeeToMaxFeeTotal(preComputedFees.transactions)
  const suggestedMaxADFee = preComputedFees.deployment
    ? estimatedFeeToMaxFeeTotal(preComputedFees.deployment)
    : 0n

  const maxFee = suggestedMaxFee
  const maxADFee = suggestedMaxADFee

  // void analytics.track("executeTransaction", {
  //   usesCachedFees: Boolean(preComputedFees),
  // }) // TODO: temporary disabled

  if (!(await wallet.isSessionOpen())) {
    throw Error("you need an open session")
  }
  const selectedAccount = await wallet.getSelectedAccount()

  if (!selectedAccount) {
    throw Error("no accounts")
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
    (tx) => tx.meta?.isUpgrade,
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

  if (accountNeedsDeploy) {
    const { account, txHash } = await wallet.deployAccount(selectedAccount, {
      maxFee: maxADFee,
    })
    if (!checkTransactionHash(txHash)) {
      throw Error(
        "Deploy Account Transaction could not get added to the sequencer",
      )
    }

    void analytics.track("deployAccount", {
      status: "success",
      trigger: "transaction",
      networkId: account.networkId,
    })

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

  const acc =
    selectedAccount.type !== "standard"
      ? wallet.getStarknetAccountOfType(starknetAccount, selectedAccount.type)
      : starknetAccount

  if (!isAccountV5(acc)) {
    throw new Error("Old Accounts are not supported anymore")
  }

  const transaction = await acc.execute(transactions, abis, {
    ...transactionsDetail,
    nonce,
    maxFee,
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

  if (!nonceWasProvidedByUI && finalityStatus === "RECEIVED") {
    await increaseStoredNonce(selectedAccount)
  }

  if ("isUpgrade" in meta && meta.isUpgrade) {
    await resetStoredNonce(selectedAccount) // reset nonce after upgrade. This is needed because nonce was managed by AccountContract before 0.10.0
  }

  return transaction
}
