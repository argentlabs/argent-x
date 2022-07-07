import { uniqWith } from "lodash-es"
import { Status } from "starknet"

import { KeyValueStorage } from "../../shared/storage/keyvalue"
import { Transaction, TransactionRequest } from "../../shared/transactions"
import { WalletAccount } from "../../shared/wallet.model"
import { accountsEqual } from "../../shared/wallet.service"
import { getTransactionsStatusUpdate } from "./determineUpdates"
import { getTransactionsUpdate } from "./onchain"
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
  handleUpdate: () => Promise<void>
}

export type TransactionUpdateListener = (updates: Transaction[]) => void

type GetTransactionsTracker = (
  getTransactionsStore: GetTransactionsStore,
  fetchTransactions: FetchTransactions,
  onUpdate?: TransactionUpdateListener,
) => Promise<TransactionTracker>

const transactionTrackerMemoryStore = new KeyValueStorage(
  {
    accounts: [] as WalletAccount[],
    updateCounter: 0,
  },
  "transactionTracker",
)

export const getTransactionsTracker: GetTransactionsTracker = async (
  getTransactionsStore,
  fetchTransactions,
  onUpdate,
  checkHistory = 4 * 5, // check history every 20 update cycles ~ 5 minutes when update interval is 15 seconds
) => {
  const accounts = await transactionTrackerMemoryStore.getItem("accounts")
  const transactionsStore = getTransactionsStore()

  const updateCounter = await transactionTrackerMemoryStore.getItem(
    "updateCounter",
  )
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

    await transactionTrackerMemoryStore.setItem(
      "updateCounter",
      (updateCounter + 1) % checkHistory,
    ) // as this is done at the very end, onerror it will not be incremented and therefore keep the history cycle refreshing at 15 seconds
  }

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
      const initialAccounts = uniqWith(accountsToPopulate, accountsEqual)
      return transactionTrackerMemoryStore.setItem("accounts", initialAccounts)
    },
    add,
    addAccount: async (account, transaction) => {
      if (
        !accounts.find((existingAccount) =>
          accountsEqual(existingAccount, account),
        )
      ) {
        return transactionTrackerMemoryStore.setItem("accounts", [
          ...accounts,
          account,
        ])
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
    handleUpdate,
  }
}
