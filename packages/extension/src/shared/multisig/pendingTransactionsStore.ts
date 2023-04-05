import { AllowArray } from "starknet"

import { ArrayStorage } from "../storage"
import { ExtendedTransactionType } from "../transactions"
import { ApiMultisigState, ApiMultisigTransaction } from "./multisig.model"

export type MultisigPendingTransaction = {
  requestId: string
  address: string
  networkId: string
  timestamp: number
  transaction: ApiMultisigTransaction
  type?: ExtendedTransactionType
  approvedSigners: string[]
  nonApprovedSigners: string[]
  state: ApiMultisigState
  creator: string
  nonce: number
  transactionHash: string
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
  pendingTransactions: AllowArray<MultisigPendingTransaction>,
): Promise<void> {
  return multisigPendingTransactionsStore.push(pendingTransactions)
}

export async function removeFromMultisigPendingTransactions(
  pendingTransactions: AllowArray<MultisigPendingTransaction>,
): Promise<MultisigPendingTransaction[]> {
  return multisigPendingTransactionsStore.remove(pendingTransactions)
}
