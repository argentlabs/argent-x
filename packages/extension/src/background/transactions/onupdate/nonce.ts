import { resetStoredNonce } from "../../nonce"
import { TransactionUpdateListener } from "./type"

export const checkResetStoredNonce: TransactionUpdateListener = async (
  transactions,
) => {
  for (const transaction of transactions) {
    // on error remove stored (increased) nonce
    if (transaction.account && transaction.executionStatus === "REJECTED") {
      await resetStoredNonce(transaction.account)
    }
  }
}
