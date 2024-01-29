import { memoize } from "lodash-es"
import { AllowArray } from "starknet"

import { addTransaction } from "../transactions/store"
import { ArrayStorage } from "../storage"
import { SelectorFn } from "../storage/types"
import { ExtendedTransactionType } from "../transactions"
import { BaseWalletAccount } from "../wallet.model"
import { getAccountIdentifier } from "../wallet.service"
import { ApiMultisigState, ApiMultisigTransaction } from "./multisig.model"
import { getMultisigAccountFromBaseWallet } from "./utils/baseMultisig"
import { accountsEqual } from "../utils/accountsEqual"

export type MultisigPendingTransaction = {
  requestId: string
  account: BaseWalletAccount
  timestamp: number
  transaction: ApiMultisigTransaction
  type?: ExtendedTransactionType
  approvedSigners: string[]
  nonApprovedSigners: string[]
  state: ApiMultisigState
  creator: string
  nonce: number
  transactionHash: string
  notify: boolean
}
export const multisigPendingTransactionsStore =
  new ArrayStorage<MultisigPendingTransaction>([], {
    namespace: "core:multisig:pendingTransactions",
    compare: (a, b) => a.requestId === b.requestId,
  })

export const byAccountSelector = memoize(
  (account?: BaseWalletAccount) =>
    (transaction: MultisigPendingTransaction) => {
      return accountsEqual(transaction.account, account)
    },
  (account) => (account ? getAccountIdentifier(account) : "unknown-account"),
)

export async function getMultisigPendingTransactions(
  selector: SelectorFn<MultisigPendingTransaction> = () => true,
): Promise<MultisigPendingTransaction[]> {
  return multisigPendingTransactionsStore.get(selector)
}

export async function getMultisigPendingTransaction(
  requestId: string,
): Promise<MultisigPendingTransaction | undefined> {
  const pendingTransactions = await getMultisigPendingTransactions(
    (transaction) => transaction.requestId === requestId,
  )

  if (pendingTransactions.length === 0) {
    return undefined
  }

  return pendingTransactions[0]
}

export async function addToMultisigPendingTransactions(
  pendingTransactions: AllowArray<MultisigPendingTransaction>,
): Promise<void> {
  return multisigPendingTransactionsStore.push(pendingTransactions)
}

export async function removeFromMultisigPendingTransactions(
  pendingTransactions: AllowArray<MultisigPendingTransaction>,
): Promise<MultisigPendingTransaction[]> {
  return multisigPendingTransactionsStore.remove(pendingTransactions)
}

export async function multisigPendingTransactionToTransaction(
  requestId: string,
  state: ApiMultisigState,
): Promise<void> {
  const pendingTxn = await getMultisigPendingTransaction(requestId)

  if (!pendingTxn) {
    throw new Error("Pending Multisig transaction not found")
  }

  const { transaction, type, transactionHash, account } = pendingTxn

  const multisigAccount = await getMultisigAccountFromBaseWallet(account)

  if (!multisigAccount) {
    throw new Error("Multisig account not found")
  }

  if (state === "AWAITING_SIGNATURES") {
    throw new Error("Transaction is still awaiting signatures")
  }

  const finalityStatus = state === "CANCELLED" ? "CANCELLED" : "RECEIVED"

  await addTransaction(
    {
      hash: transactionHash,
      account: multisigAccount,
      meta: {
        type,
        transactions: transaction.calls,
      },
    },
    { finality_status: finalityStatus },
  )

  await removeFromMultisigPendingTransactions(pendingTxn)
}

export async function setHasSeenTransaction(requestId: string) {
  const pendingTxn = await getMultisigPendingTransaction(requestId)

  if (!pendingTxn || !pendingTxn.notify) {
    return
  }

  return await multisigPendingTransactionsStore.push({
    ...pendingTxn,
    notify: false,
  })
}

export const cancelPendingMultisigTransactions = async (
  account: BaseWalletAccount,
) => {
  const pendingTransactions = await getMultisigPendingTransactions(
    byAccountSelector(account),
  )

  for (const pendingTransaction of pendingTransactions) {
    await multisigPendingTransactionToTransaction(
      pendingTransaction.requestId,
      "CANCELLED",
    )
  }
}
