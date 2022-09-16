import { checkResetStoredNonce } from "./nonce"
import { notifyAboutCompletedTransactions } from "./notifications"
import { TransactionUpdateListener } from "./type"
import { handleUpgradeTransaction } from "./upgrade"

const addedOrUpdatedHandlers: TransactionUpdateListener[] = [
  handleUpgradeTransaction,
  checkResetStoredNonce,
]

export const runAddedOrUpdatedHandlers: TransactionUpdateListener = async (
  updates,
) => {
  await Promise.allSettled(
    addedOrUpdatedHandlers.map((handler) => handler(updates)),
  )
}

const changedStatusHandlers: TransactionUpdateListener[] = [
  notifyAboutCompletedTransactions,
]

export const runChangedStatusHandlers: TransactionUpdateListener = async (
  updates,
) => {
  await Promise.allSettled(
    changedStatusHandlers.map((handler) => handler(updates)),
  )
}
