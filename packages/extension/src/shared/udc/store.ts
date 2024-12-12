import { ArrayStorage } from "../storage"
import type { Transaction } from "../transactions"
import { compareTransactions } from "../transactions"

export const declaredTransactionsStore = new ArrayStorage<Transaction>([], {
  namespace: "core:udcDeclaredTransactions",
  areaName: "local",
  compare: compareTransactions,
})
