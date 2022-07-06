import { Transaction, TransactionBase } from "../../shared/transactions"
import { Storage } from "../storage"
import { ArrayStorage } from "../storage/array"

export type GetTransactionsStore = () => ArrayStorage<Transaction>

export const compareTransactions = (
  a: TransactionBase,
  b: TransactionBase,
): boolean => a.hash === b.hash && a.account.networkId === a.account.networkId

export const getTransactionsStore = () =>
  new ArrayStorage<Transaction>(
    [],
    new Storage({ inner: [] }, "transactionsStore"),
    compareTransactions,
  )
