import { Transaction, compareTransactions } from "../../shared/transactions"
import { Storage } from "../storage"
import { ArrayStorage } from "../storage/array"

export type GetTransactionsStore = () => ArrayStorage<Transaction>

export const getTransactionsStore = () =>
  new ArrayStorage<Transaction>(
    [],
    new Storage({ inner: [] }, "transactionsStore"),
    compareTransactions,
  )
