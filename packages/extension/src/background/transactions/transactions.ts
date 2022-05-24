import { uniqWith } from "lodash-es"
import { Status } from "starknet"

import { Transaction, TransactionRequest } from "../../shared/transactions"
import { WalletAccount } from "../../shared/wallet.model"
import { equalAccount } from "../wallet"
import { getTransactionsStatusUpdate } from "./determineUpdates"
import { getTransactionsUpdate } from "./onchain"
import { setIntervalAsync } from "./setIntervalAsync"
import type { GetTransactionsStore } from "./store"
import { getHistoryTransactionsForAccounts } from "./voyager"

const timestampInSeconds = (): number => Math.floor(Date.now() / 1000)

export interface TransactionTracker {
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
  accountsToPopulate: WalletAccount[],
  getTransactionsStore: GetTransactionsStore,
  onUpdate?: TransactionUpdateListener,
  updateInterval?: number,
) => Promise<TransactionTracker>

export const getTransactionsTracker: GetTransactionsTracker = async (
  accountsToPopulate,
  getTransactionsStore,
  onUpdate,
  updateInterval = 15e3, // 15 seconds
) => {
  const accounts = uniqWith(accountsToPopulate, equalAccount)
  const initialTransactions = await getHistoryTransactionsForAccounts(accounts)

  const transactionsStore = getTransactionsStore(initialTransactions)

  const updateHandler = async () => {
    const allTransactions = await transactionsStore.getItems()
    const historyTransactions = await getHistoryTransactionsForAccounts(
      accounts,
      allTransactions,
    )
    const pendingTransactions = await transactionsStore.getItems(
      ({ hash }) =>
        !historyTransactions.some(
          ({ hash: historyHash }) => hash === historyHash,
        ),
    )

    const onChainUpdates = await getTransactionsUpdate(pendingTransactions)

    const historyUpdates = getTransactionsStatusUpdate(
      allTransactions,
      historyTransactions,
    )

    const updates = [...onChainUpdates, ...historyUpdates]

    await transactionsStore.addItems(updates)
    onUpdate?.(updates)
  }

  const clearUpdate = setIntervalAsync(updateHandler, updateInterval)

  return {
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
