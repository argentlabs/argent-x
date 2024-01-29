import { resetStoredNonce } from "../../nonce"
import { TransactionUpdateListener } from "./type"
import { getTransactionStatus } from "../../../shared/transactions/utils"

export const checkResetStoredNonce: TransactionUpdateListener = async (
  transactions,
) => {
  for (const transaction of transactions) {
    // on error remove stored (increased) nonce
    const { finality_status } = getTransactionStatus(transaction)
    if (transaction.account && finality_status === "REJECTED") {
      await resetStoredNonce(transaction.account)
    }
  }
}
