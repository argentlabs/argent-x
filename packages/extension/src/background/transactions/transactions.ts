import { uniqWith } from "lodash-es"
import { Status } from "starknet"

import {
  Transaction,
  TransactionBase,
  TransactionRequest,
  compareTransactions,
} from "../../shared/transactions"
import { WalletAccount } from "../../shared/wallet.model"
import { accountsEqual } from "../../shared/wallet.service"
import { getTransactionsStatusUpdate } from "./determineUpdates"
import { getTransactionsUpdate } from "./onchain"
import { setIntervalAsync } from "./setIntervalAsync"
import { GetTransactionsStore } from "./store"
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
  get: (transaction: TransactionBase) => Promise<Transaction | null>
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
        historyTransactions.findIndex((tx2) => compareTransactions(tx, tx2)) ===
        -1,
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
      const allTransactions = await transactionsStore.getItems()
      const initialAccounts = uniqWith(accountsToPopulate, accountsEqual)
      const initialTransactions = await getTransactionHistory(
        initialAccounts,
        allTransactions,
        fetchTransactions,
      )
      transactionsStore.addItems(initialTransactions)
      accounts.splice(0, accounts.length, ...initialAccounts)
    },
    add,
    addAccount: async (account, transaction) => {
      if (
        !accounts.find((existingAccount) =>
          accountsEqual(existingAccount, account),
        )
      ) {
        accounts.push(account)
      }
      await add(transaction)
    },
    get: (transaction: TransactionBase) =>
      transactionsStore.getItem((tx) => compareTransactions(tx, transaction)),
    getAll: (statusIn) =>
      transactionsStore.getItems(
        statusIn
          ? (transaction) => statusIn.includes(transaction.status)
          : undefined,
      ),
    stop: clearUpdate,
  }
}
