import { filter, uniqBy } from "lodash-es"
import { useEffect } from "react"
import create from "zustand"

import { messageStream } from "../../../shared/messages"
import { Transaction } from "../../../shared/transactions"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { accountsEqual } from "../../../shared/wallet.service"
import { getTransactions } from "../../services/backgroundTransactions"

interface State {
  transactions: Transaction[]
  addTransactions: (transactions: Transaction[]) => void
}

function mergeTransactionArrays(
  transactions: Transaction[],
  newTransactions: Transaction[],
): Transaction[] {
  return uniqBy([...newTransactions, ...transactions], "hash")
}

const useTransactionsStore = create<State>((set) => ({
  transactions: [],
  addTransactions: (transactions: Transaction[]) => {
    set((state) => ({
      ...state,
      transactions: mergeTransactionArrays(state.transactions, transactions),
    }))
  },
}))

export const useAccountTransactions = (account: BaseWalletAccount) => {
  useEffect(() => {
    getTransactions(account).then((transactions) => {
      useTransactionsStore.setState({ transactions })
    })

    const subscription = messageStream.subscribe(([message]) => {
      if (message.type === "TRANSACTION_UPDATES") {
        useTransactionsStore
          .getState()
          .addTransactions(
            filter(message.data, (transaction) =>
              accountsEqual(transaction.account, account),
            ),
          )
      }
    })

    return () => {
      if (!subscription.closed) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const transactions = useTransactionsStore((state) =>
    state.transactions.sort((a, b) => b.timestamp - a.timestamp),
  )
  const pendingTransactions = transactions.filter(
    ({ status }) => status === "RECEIVED",
  )
  return { transactions, pendingTransactions }
}
