import { ArrayStorage } from "../storage"
import { Transaction, compareTransactions } from "../transactions"

export const declaredTransactionsStore = new ArrayStorage<Transaction>([], {
  namespace: "core:udcDeclaredTransactions",
  areaName: "local",
  compare: compareTransactions,
})
