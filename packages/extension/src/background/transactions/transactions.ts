import { uniqWith } from "lodash-es"
import { Status } from "starknet"

import { Transaction, TransactionRequest } from "../../shared/transactions"
import { WalletAccount } from "../../shared/wallet.model"
import { equalAccount } from "../wallet"
import { getTransactionsStatusUpdate } from "./determineUpdates"
import { getTransactionsUpdate } from "./onchain"
import { setIntervalAsync } from "./setIntervalAsync"
import type { GetTransactionsStore } from "./store"
import { checkTransactionHash } from "./transactionExecution"
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
  checkHistory = 4 * 5, // check history every 20 update cycles ~ 5 minutes when update interval is 15 seconds
) => {
  const accounts: WalletAccount[] = []
  const transactionsStore = getTransactionsStore()

  let updateCounter = 0
  const handleUpdate = async () => {
    const allTransactions = await transactionsStore.getItems()
    const needsHistoryUpdate = updateCounter === 0

    const historyTransactions = needsHistoryUpdate
      ? await getTransactionHistory(
          accounts,
          allTransactions,
          fetchTransactions,
        )
      : []
    const historyUpdates = getTransactionsStatusUpdate(
      allTransactions,
      historyTransactions,
    )

    const pendingTransactions = allTransactions.filter(
      (tx) =>
        historyTransactions.findIndex((tx2) => tx.hash === tx2.hash) === -1,
    )

    const onChainUpdates = await getTransactionsUpdate(pendingTransactions)

    const updates = [...onChainUpdates, ...historyUpdates]

    await transactionsStore.addItems(updates)
    onUpdate?.(updates)

    updateCounter = (updateCounter + 1) % checkHistory // as this is done at the very end, onerror it will not be incremented and therefore keep the history cycle refreshing at 15 seconds
  }

  const clearUpdate = setIntervalAsync(handleUpdate, updateInterval)

  const add = async (transaction: TransactionRequest) => {
    // sanity checks
    if (!checkTransactionHash(transaction.hash)) {
      return // dont throw
    }

    const newTransaction = {
      status: "RECEIVED" as const,
      timestamp: timestampInSeconds(),
      ...transaction,
    }
    await transactionsStore.addItem(newTransaction)
    onUpdate?.([newTransaction])
  }

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
    add,
    addAccount: async (account, transaction) => {
      if (
        !accounts.find((existingAccount) =>
          equalAccount(existingAccount, account),
        )
      ) {
        accounts.push(account)
      }
      await add(transaction)
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
