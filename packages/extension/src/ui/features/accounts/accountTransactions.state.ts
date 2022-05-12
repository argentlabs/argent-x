import { useEffect } from "react"
import create from "zustand"

import { messageStream } from "../../../shared/messages"
import { Transaction } from "../../../shared/transactions"
import { getTransactions } from "../../services/messaging"

interface State {
  transactions: Transaction[]
  addTransactions: (transactions: Transaction[]) => void
}

function mergeTransactionsArrays(
  transactions: Transaction[],
  newTransactions: Transaction[],
): Transaction[] {
  return [
    ...transactions.filter(
      (transaction) =>
        !newTransactions.find((t) => t.hash === transaction.hash),
    ),
    ...newTransactions,
  ]
}

const useTransactionsStore = create<State>((set) => ({
  transactions: [],
  addTransactions: (transactions: Transaction[]) => {
    set((state) => ({
      ...state,
      transactions: mergeTransactionsArrays(state.transactions, transactions),
    }))
  },
}))

export const useAccountTransactions = (accountAddress: string) => {
  useEffect(() => {
    getTransactions(accountAddress).then((transactions) => {
      useTransactionsStore.setState({ transactions })
    })

    const subscription = messageStream.subscribe(([message]) => {
      if (message.type === "TRANSACTION_UPDATES") {
        useTransactionsStore
          .getState()
          .addTransactions(
            message.data.filter(
              ({ account }) => account.address === accountAddress,
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
