import { updateAccountDetails } from "../../../shared/account/update"
import { TransactionUpdateListener } from "./type"

export const handleUpgradeTransaction: TransactionUpdateListener = async (
  transactions,
) => {
  const upgrades = transactions.filter(
    (transaction) => transaction.meta?.isUpgrade,
  )
  if (upgrades.length > 0) {
    await updateAccountDetails(
      "implementation",
      upgrades.map((transaction) => transaction.account),
    )
  }
}
