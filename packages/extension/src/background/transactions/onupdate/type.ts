import type { Transaction } from "../../../shared/transactions"

export type TransactionUpdateListener = (
  updates: Transaction[],
) => void | Promise<void>
