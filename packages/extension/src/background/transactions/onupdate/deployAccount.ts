import { updateAccountDetails } from "../../../shared/account/update"
import { SUCCESS_STATUSES } from "../../../shared/transactions"
import { TransactionUpdateListener } from "./type"

export const handleDeployAccountTransaction: TransactionUpdateListener = async (
  transactions,
) => {
  const deployAccountTxns = transactions.filter(
    (transaction) =>
      transaction.meta?.type === "DEPLOY_ACCOUNT" &&
      SUCCESS_STATUSES.includes(transaction.status),
  )
  if (deployAccountTxns.length > 0) {
    await updateAccountDetails(
      "deploy",
      deployAccountTxns.map((transaction) => transaction.account),
    )
  }
}
