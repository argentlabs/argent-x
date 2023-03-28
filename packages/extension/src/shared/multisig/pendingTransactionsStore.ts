import { Call } from "starknet"

import { ArrayStorage } from "../storage"
import { ExtendedTransactionType } from "../transactions"

export type MultisigPendingTransaction = {
  requestId: string
  address: string
  networkId: string
  timestamp: number
  transactions?: Call | Call[]
  type?: ExtendedTransactionType
}
export const multisigPendingTransactionsStore =
  new ArrayStorage<MultisigPendingTransaction>([], {
    namespace: "core:multisig:pendingTransactions",
    compare: (a, b) => a.requestId === b.requestId,
  })

export async function getMultisigPendingTransactions(): Promise<
  MultisigPendingTransaction[]
> {
  return multisigPendingTransactionsStore.get()
}

export async function addToMultisigPendingTransactions(
  pendingTransaction: MultisigPendingTransaction,
): Promise<void> {
  return multisigPendingTransactionsStore.push(pendingTransaction)
}

export async function removeFromMultisigPendingTransactions(
  pendingTransaction: MultisigPendingTransaction,
): Promise<void> {
  multisigPendingTransactionsStore.remove(pendingTransaction)
}
