import { useEffect } from "react"
import create from "zustand"

import { messageStream } from "../../shared/messages"
import { TransactionStatus } from "../../shared/transactions.model"
import { getTransactions } from "../utils/messaging"

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

    const listener = messageStream.subscribe(([message]) => {
      if (message.type === "TRANSACTION_UPDATES") {
        useTransactionsStore.setState({
          transactions: message.data.filter(
            ({ walletAddress: wa }) => wa === accountAddress,
          ),
        })
      }
    })

    return () => {
      if (!listener.closed) {
        listener.unsubscribe()
      }
    }
  }, [])

  return useTransactionsStore((state) => state.transactions)
}
