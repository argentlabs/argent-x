import { uniqWith } from "lodash-es"
import { Status } from "starknet"

import { Transaction, TransactionRequest } from "../../shared/transactions"
import { WalletAccount } from "../../shared/wallet.model"
import { equalAccount } from "../wallet"
import { getTransactionsStatusUpdate } from "./determineUpdates"
import { getTransactionsUpdate } from "./onchain"
import { setIntervalAsync } from "./setIntervalAsync"
import type { GetTransactionsStore } from "./store"
import { FetchTransactions, getTransactionHistory } from "./voyager"

const timestampInSeconds = (): number => Math.floor(Date.now() / 1000)

export interface TransactionTracker {
  load: (accountsToPopulate: WalletAccount[]) => Promise<void>
  add: (transaction: TransactionRequest) => Promise<void>
  addAccount: (
    account: WalletAccount,
    transaction: TransactionRequest,
  ) => Promise<void>
  get: (transactionHash: string) => Promise<Transaction | null>
  getAll: (statusIn?: Status[]) => Promise<Transaction[]>
  stop: () => void
}

export type TransactionUpdateListener = (updates: Transaction[]) => void

type GetTransactionsTracker = (
  getTransactionsStore: GetTransactionsStore,
  fetchTransactions: FetchTransactions,
  onUpdate?: TransactionUpdateListener,
  updateInterval?: number,
) => TransactionTracker

export const getTransactionsTracker: GetTransactionsTracker = (
  getTransactionsStore,
  fetchTransactions,
  onUpdate,
  updateInterval = 15e3, // 15 seconds
  checkHistory = 4, // check history every 4 update cycles
) => {
  const accounts: WalletAccount[] = []
  const transactionsStore = getTransactionsStore()

  let updateCounter = 0
  const handleUpdate = async () => {
    const allTransactions = await transactionsStore.getItems()

    const onChainUpdates = await getTransactionsUpdate(allTransactions)

    const updates = onChainUpdates

    if (updateCounter === 0) {
      const historyTransactions = await getTransactionHistory(
        accounts,
        allTransactions,
        fetchTransactions,
      )
      const historyUpdates = getTransactionsStatusUpdate(
        allTransactions,
        historyTransactions,
      )

      updates.push(...historyUpdates)
    }
    updateCounter = (updateCounter + 1) % checkHistory

    await transactionsStore.addItems(updates)
    onUpdate?.(updates)
  }

  const clearUpdate = setIntervalAsync(handleUpdate, updateInterval)

  return {
    load: async (accountsToPopulate) => {
      const initialAccounts = uniqWith(accountsToPopulate, equalAccount)
      const initialTransactions = await getTransactionHistory(
        initialAccounts,
        [],
        fetchTransactions,
      )
      transactionsStore.addItems(initialTransactions)
      accounts.splice(0, accounts.length, ...initialAccounts)
    },
    add: (transaction) => {
      const newTransaction = {
        status: "RECEIVED" as const,
        timestamp: timestampInSeconds(),
        ...transaction,
      }
      onUpdate?.([newTransaction])
      return transactionsStore.addItem(newTransaction)
    },
    addAccount: async (account, transaction) => {
      if (
        !accounts.find((existingAccount) =>
          equalAccount(existingAccount, account),
        )
      ) {
        accounts.push(account)
      }
      await transactionsStore.addItem({
        status: "RECEIVED",
        timestamp: timestampInSeconds(),
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
