import { memoize } from "lodash-es"
import { AllowArray } from "starknet"

import { addTransaction } from "../../background/transactions/store"
import { ArrayStorage } from "../storage"
import { SelectorFn } from "../storage/types"
import { ExtendedTransactionType } from "../transactions"
import { BaseWalletAccount } from "../wallet.model"
import { getAccountIdentifier } from "../wallet.service"
import { ApiMultisigState, ApiMultisigTransaction } from "./multisig.model"
import { getMultisigAccountFromBaseWallet } from "./utils/baseMultisig"

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
  notify: boolean
}
export const multisigPendingTransactionsStore =
  new ArrayStorage<MultisigPendingTransaction>([], {
    namespace: "core:multisig:pendingTransactions",
    compare: (a, b) => a.requestId === b.requestId,
  })

export const byAccountSelector = memoize(
  (account?: BaseWalletAccount) => (transaction: MultisigPendingTransaction) =>
    Boolean(account && transaction.address === account.address),
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

  const { transaction, type, transactionHash, networkId, address } = pendingTxn

  const multisigAccount = await getMultisigAccountFromBaseWallet({
    address,
    networkId,
  })

  if (!multisigAccount) {
    throw new Error("Multisig account not found")
  }

  if (state === "AWAITING_SIGNATURES") {
    throw new Error("Transaction is still awaiting signatures")
  }

  await addTransaction(
    {
      hash: transactionHash,
      account: multisigAccount,
      meta: {
        type,
        transactions: transaction.calls,
      },
    },
    state === "CANCELLED" ? "CANCELLED" : "RECEIVED",
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
