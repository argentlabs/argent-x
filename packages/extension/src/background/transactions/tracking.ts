import { uniqWith } from "lodash-es"

import { Transaction, getInFlightTransactions } from "../../shared/transactions"
import { WalletAccount } from "../../shared/wallet.model"
import { accountsEqual } from "../../shared/wallet.service"
import { getTransactionsUpdate } from "./sources/onchain"
import { getTransactionHistory } from "./sources/voyager"
import { transactionsStore } from "./store"

export interface TransactionTracker {
  loadHistory: (accountsToPopulate: WalletAccount[]) => Promise<void>
  update: () => Promise<Transaction[]>
}

export const transactionTracker: TransactionTracker = {
  async loadHistory(accountsToPopulate: WalletAccount[]) {
    const allTransactions = await transactionsStore.get()
    const uniqAccounts = uniqWith(accountsToPopulate, accountsEqual)
    const historyTransactions = await getTransactionHistory(
      uniqAccounts,
      allTransactions,
    )
    return transactionsStore.push(historyTransactions)
  },
  async update() {
    const allTransactions = await transactionsStore.get()
    const updatedTransactions = await getTransactionsUpdate(
      // is smart enough to filter for just the pending transactions, as the rest needs no update
      allTransactions,
    )
    await transactionsStore.push(updatedTransactions)
    return getInFlightTransactions(allTransactions)
  },
}
