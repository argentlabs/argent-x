import { memoize } from "lodash-es"
import { useMemo } from "react"

import { SelectorFn } from "./../../../shared/storage/types"
import {
  MultisigPendingTransaction,
  multisigPendingTransactionsStore,
} from "../../../shared/multisig/pendingTransactionsStore"
import { useArrayStorage } from "../../../shared/storage/hooks"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { getAccountIdentifier } from "../../../shared/wallet.service"

type UseMultisigAccountPendingTransactions = (
  account?: BaseWalletAccount,
) => MultisigPendingTransaction[]

const byAccountSelector = memoize(
  (account?: BaseWalletAccount) => (transaction: MultisigPendingTransaction) =>
    Boolean(account && transaction.address === account.address),
  (account) => (account ? getAccountIdentifier(account) : "unknown-account"),
)

export const useMultisigPendingTransactions = (
  selector?: SelectorFn<MultisigPendingTransaction>,
  sorted = true,
) => {
  const transactions = useArrayStorage(
    multisigPendingTransactionsStore,
    selector,
  )
  const sortedMultisigTransactions = useMemo(
    () => transactions.sort((a, b) => b.timestamp - a.timestamp),
    [transactions],
  )

  return sorted ? sortedMultisigTransactions : transactions
}

export const useMultisigPendingTransactionsByAccount: UseMultisigAccountPendingTransactions =
  (account) => {
    return useMultisigPendingTransactions(byAccountSelector(account))
  }

export const useMultisigPendingTransaction = (requestId?: string) => {
  const [transaction] = useMultisigPendingTransactions(
    (transaction) => transaction.requestId === requestId,
  )

  if (!requestId) {
    return undefined
  }

  return transaction
}
