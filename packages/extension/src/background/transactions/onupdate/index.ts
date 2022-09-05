import { notifyAboutCompletedTransactions } from "./notifications"
import { TransactionUpdateListener } from "./type"
import { handleUpgradeTransaction } from "./upgrade"

const updateHandlers: TransactionUpdateListener[] = [
  notifyAboutCompletedTransactions,
  handleUpgradeTransaction,
]

export const runUpdateHandlers: TransactionUpdateListener = async (updates) => {
  await Promise.allSettled(updateHandlers.map((handler) => handler(updates)))
}
