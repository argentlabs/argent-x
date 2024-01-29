import { updateAccountDetails } from "../../../shared/account/update"
import { SUCCESS_STATUSES } from "../../../shared/transactions"
import { TransactionUpdateListener } from "./type"
import { getTransactionStatus } from "../../../shared/transactions/utils"

export const handleDeployAccountTransaction: TransactionUpdateListener = async (
  transactions,
) => {
  const deployAccountTxns = transactions.filter((transaction) => {
    const { finality_status } = getTransactionStatus(transaction)
    return (
      transaction.meta?.isDeployAccount &&
      finality_status &&
      SUCCESS_STATUSES.includes(finality_status)
    )
  })
  if (deployAccountTxns.length > 0) {
    await updateAccountDetails(
      "deploy",
      deployAccountTxns.map((transaction) => transaction.account),
    )
  }
}
