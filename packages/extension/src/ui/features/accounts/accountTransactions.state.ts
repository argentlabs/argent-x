import { useEffect } from "react"
import create from "zustand"

import { messageStream } from "../../../shared/messages"
import { TransactionStatus } from "../../../shared/transactions.model"
import { getTransactions } from "../../utils/messaging"

interface State {
  transactions: TransactionStatus[]
}

const useTransactionsStore = create<State>(() => ({
  transactions: [],
}))

export const useAccountTransactions = (accountAddress: string) => {
  useEffect(() => {
    getTransactions(accountAddress).then((transactions) => {
      useTransactionsStore.setState({ transactions })
    })

    const subscription = messageStream.subscribe(([message]) => {
      if (message.type === "TRANSACTION_UPDATES") {
        useTransactionsStore.setState({
          transactions: message.data.filter(
            ({ accountAddress: address }) => address === accountAddress,
          ),
        })
      }
    })

    return () => {
      if (!subscription.closed) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const transactions = useTransactionsStore((state) => state.transactions)
  const pendingTransactions = transactions.filter(
    ({ status }) => status === "RECEIVED",
  )
  return { transactions, pendingTransactions }
}
