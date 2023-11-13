import {
  constants,
  num,
  TransactionFinalityStatus,
  TransactionExecutionStatus,
} from "starknet"
import {
  ExtQueueItem,
  TransactionActionPayload,
} from "../../shared/actionQueue/types"
import {
  ExtendedTransactionStatus,
  TransactionRequest,
  nameTransaction,
} from "../../shared/transactions"
import { WalletAccount } from "../../shared/wallet.model"
import { accountsEqual } from "../../shared/utils/accountsEqual"
import { isAccountDeployed } from "../accountDeploy"
import { analytics } from "../analytics"
import { getNonce, increaseStoredNonce, resetStoredNonce } from "../nonce"
import { argentMaxFee } from "../utils/argentMaxFee"
import { Wallet } from "../wallet"
import { getEstimatedFees } from "../../shared/transactionSimulation/fees/estimatedFeesRepository"
import { addTransaction, transactionsStore } from "./store"
import { isAccountV5 } from "../../shared/utils/accountv4"
import { getMultisigAccountFromBaseWallet } from "../../shared/multisig/utils/baseMultisig"

export const checkTransactionHash = (
  transactionHash?: num.BigNumberish,
  account?: WalletAccount,
): boolean => {
  try {
    if (!transactionHash) {
      throw Error("transactionHash not defined")
    }
    const bn = num.toBigInt(transactionHash)
    if (bn <= constants.ZERO && account?.type !== "multisig") {
      throw Error("transactionHash needs to be >0")
    }
    return true
  } catch {
    return false
  }
}

type TransactionAction = ExtQueueItem<{
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
    transactionsDetail?.maxFee ?? preComputedFees.suggestedMaxFee
  const suggestedMaxADFee = preComputedFees.maxADFee ?? "0"

  const maxFee = argentMaxFee(suggestedMaxFee)
  const maxADFee = argentMaxFee(suggestedMaxADFee)

  void analytics.track("executeTransaction", {
    usesCachedFees: Boolean(preComputedFees),
  })

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

  const pendingAccountTransactions = allTransactions.filter(
    (tx) =>
      tx.finalityStatus === TransactionFinalityStatus.RECEIVED &&
      tx.executionStatus !== TransactionExecutionStatus.REJECTED && // Rejected transactions have finality status RECEIVED
      accountsEqual(tx.account, selectedAccount),
  )

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

  const finalityStatus: ExtendedTransactionStatus =
    multisig && multisig.threshold > 1
      ? TransactionFinalityStatus.NOT_RECEIVED
      : TransactionFinalityStatus.RECEIVED

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
  await addTransaction(tx, finalityStatus)

  if (
    !nonceWasProvidedByUI &&
    finalityStatus === TransactionFinalityStatus.RECEIVED
  ) {
    await increaseStoredNonce(selectedAccount)
  }

  if ("isUpgrade" in meta && meta.isUpgrade) {
    await resetStoredNonce(selectedAccount) // reset nonce after upgrade. This is needed because nonce was managed by AccountContract before 0.10.0
  }

  return transaction
}
