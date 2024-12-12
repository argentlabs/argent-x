import { addressSchema } from "@argent/x-shared"
import type { TransactionActionPayload } from "../actionQueue/types"
import { transformTransaction } from "../activity/utils/transform"
import { isUpgradeTransaction } from "../activity/utils/transform/is"
import type { Transaction } from "../transactions"

// This function checks if a transaction is a safe upgrade transaction
// with backwards compatibility for old upgrade transactions
export const isSafeUpgradeTransaction = (
  transaction: Transaction | TransactionActionPayload,
) => {
  const meta = transaction.meta
  if (!meta) {
    return false
  }
  const isNewUpgradeTxn = addressSchema.safeParse(meta.newClassHash).success
  const isOldUpgradeTxn = "isUpgrade" in meta && Boolean(meta.isUpgrade)

  // This is for multisig accounts
  let isUpgradeCalldata = false
  // this is to validate if transaction is a Transaction and not a TransactionActionPayload
  if ("status" in transaction) {
    const transformedTx = transformTransaction({ transaction })
    isUpgradeCalldata = !!transformedTx && isUpgradeTransaction(transformedTx)
  }
  return isNewUpgradeTxn || isOldUpgradeTxn || isUpgradeCalldata
}
