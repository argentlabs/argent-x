import { addressSchema } from "@argent/x-shared"
import { Transaction } from "../transactions"

// This function checks if a transaction is a safe upgrade transaction
// with backwards compatibility for old upgrade transactions
export const isSafeUpgradeTransaction = ({
  meta,
}: Pick<Transaction, "meta">) => {
  if (!meta) {
    return false
  }
  const isNewUpgradeTxn = addressSchema.safeParse(meta.newClassHash).success
  const isOldUpgradeTxn = "isUpgrade" in meta && Boolean(meta.isUpgrade)
  return isNewUpgradeTxn || isOldUpgradeTxn
}
