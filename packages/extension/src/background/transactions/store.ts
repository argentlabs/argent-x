import { Transaction } from "../../shared/transactions"
import { Storage } from "../storage"
import { ArrayStorage } from "../storage/array"

export type GetTransactionsStore = (
  initialTransactions: Transaction[],
) => ArrayStorage<Transaction>

export const getTransactionsStore = (initialTransactions: Transaction[]) =>
  new ArrayStorage<Transaction>(
    initialTransactions,
    new Storage({ inner: initialTransactions }, "transactionsStore"),
    (a, b) =>
      a.hash === b.hash && a.account.network.id === a.account.network.id,
  )
