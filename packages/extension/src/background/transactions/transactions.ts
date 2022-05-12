import { Status } from "starknet"

import { AddTransaction, Transaction } from "../../shared/transactions"
import { WalletAccount } from "../../shared/wallet.model"
import { getTransactionsStatusUpdate } from "./determineUpdates"
import { getTransactionsUpdate } from "./onchain"
import { setAsyncInterval } from "./setAsyncInterval"
import type { GetTransactionsStore } from "./store"
import { getHistoryTransactionsForAccounts } from "./voyager"

const timestampInS = (): number => Math.floor(Date.now() / 1000)

export interface TransactionsTracker {
  add: (transaction: AddTransaction) => Promise<void>
  addAccount: (
    account: WalletAccount,
    transaction: AddTransaction,
  ) => Promise<void>
  get: (transactionHash: string) => Promise<Transaction | null>
  getAll: (statusIn?: Status[]) => Promise<Transaction[]>
  stop: () => void
}

export type TransactionUpdatesListener = (updates: Transaction[]) => void

type GetTransactionsTracker = (
  accountsToPopulate: WalletAccount[],
  getTransactionsStore: GetTransactionsStore,
  onUpdate?: TransactionUpdatesListener,
  updateInterval?: number,
) => Promise<TransactionsTracker>

export const getTransactionsTracker: GetTransactionsTracker = async (
  accountsToPopulate,
  getTransactionsStore,
  onUpdate,
  updateInterval = 15 * 1000, // 15 seconds
) => {
  const accounts = new Set(accountsToPopulate)
  const initialTransactions = await getHistoryTransactionsForAccounts(
    Array.from(accounts),
  )

  const transactionsStore = getTransactionsStore(initialTransactions)

  const updateHandler = async () => {
    const allTransactions = await transactionsStore.getItems()
    const historyTransactions = await getHistoryTransactionsForAccounts(
      Array.from(accounts),
      allTransactions,
    )
    const pendingTransactions = await transactionsStore.getItems(
      ({ hash }) =>
        !historyTransactions.some(
          ({ hash: historyHash }) => hash === historyHash,
        ),
    )

    const onchainUpdates = await getTransactionsUpdate(pendingTransactions)

    const historyUpdates = getTransactionsStatusUpdate(
      allTransactions,
      historyTransactions,
    )

    const updates = [...onchainUpdates, ...historyUpdates]

    onUpdate?.(updates)

    return transactionsStore.addItems(updates)
  }

  const clearUpdate = setAsyncInterval(updateHandler, updateInterval)

  return {
    add: (transaction) =>
      transactionsStore.addItem({
        status: "RECEIVED",
        timestamp: timestampInS(),
        ...transaction,
      }),
    addAccount: async (account, transaction) => {
      accounts.add(account)
      await transactionsStore.addItem({
        status: "RECEIVED",
        timestamp: timestampInS(),
        ...transaction,
      })
    },
    get: (transactionHash) =>
      transactionsStore.getItem(
        (transaction) => transaction.hash === transactionHash,
      ),
    getAll: (statusIn) =>
      transactionsStore.getItems(
        statusIn
          ? (transaction) => statusIn.includes(transaction.status)
          : undefined,
      ),
    stop: clearUpdate,
  }
}
