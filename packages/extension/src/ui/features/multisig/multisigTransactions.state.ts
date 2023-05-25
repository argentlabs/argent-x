import { useMemo } from "react"

import { SelectorFn } from "./../../../shared/storage/types"
import {
  MultisigPendingTransaction,
  byAccountSelector,
  multisigPendingTransactionsStore,
} from "../../../shared/multisig/pendingTransactionsStore"
import { useArrayStorage } from "../../../shared/storage/hooks"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { useMultisig } from "./multisig.state"

type UseMultisigAccountPendingTransactions = (
  account?: BaseWalletAccount,
) => MultisigPendingTransaction[]

export const useMultisigPendingTransactions = (
  selector?: SelectorFn<MultisigPendingTransaction>,
  sorted = true,
) => {
  const transactions = useArrayStorage(
    multisigPendingTransactionsStore,
    selector,
  )

  return useMemo(
    () =>
      sorted
        ? transactions.sort((a, b) => b.timestamp - a.timestamp)
        : transactions,
    [transactions, sorted],
  )
}

export const useMultisigPendingTransactionsByAccount: UseMultisigAccountPendingTransactions =
  (account) => {
    return useMultisigPendingTransactions(byAccountSelector(account))
  }

export const useMultisigPendingTransaction = (requestId?: string) => {
  const [transaction] = useMultisigPendingTransactions(
    (transaction) => transaction.requestId === requestId,
  )

  return useMemo(
    () => (requestId ? transaction : undefined),
    [requestId, transaction],
  )
}

export const useMultisigPendingTransactionsAwaitingConfirmation = (
  account?: BaseWalletAccount,
) => {
  const multisig = useMultisig(account)

  return useMultisigPendingTransactionsByAccount(account).filter(
    (transaction) =>
      multisig && transaction.nonApprovedSigners.includes(multisig.publicKey),
  )
}
