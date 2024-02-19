import { handleChangeGuardianTransaction } from "./changeGuardian"
import { handleDeclareContractTransaction } from "./declareContract"
import { handleDeployAccountTransaction } from "./deployAccount"
import { handleMultisigUpdates } from "./multisigUpdates"
import { checkResetStoredNonce } from "./nonce"
import { notifyAboutCompletedTransactions } from "./notifications"
import { TransactionUpdateListener } from "./type"
import { handleUpgradeTransaction } from "./upgrade"

const addedOrUpdatedHandlers: TransactionUpdateListener[] = [
  handleDeployAccountTransaction,
  handleUpgradeTransaction,
  handleDeclareContractTransaction,
  handleChangeGuardianTransaction,
  handleMultisigUpdates,
  checkResetStoredNonce,
]

export const runAddedOrUpdatedHandlers: TransactionUpdateListener = async (
  updates,
) => {
  // We need this in serial and not parallel because some handlers depend on the
  // results of others (e.g. the upgrade handler needs the account to be deployed)
  for (const handler of addedOrUpdatedHandlers) {
    await handler(updates)
  }
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
