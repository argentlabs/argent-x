import { Call } from "starknet"

import { isErc20TransferCall } from "../../../../shared/call"
import {
  ApiTransactionReviewResponse,
  getTransactionReviewHasSwap,
} from "../../../../shared/transactionReview.service"

export const titleForTransactions = (
  transactions: Call | Call[] = [],
  transactionReview: ApiTransactionReviewResponse | undefined,
) => {
  const transactionsArray: Call[] = Array.isArray(transactions)
    ? transactions
    : [transactions]
  const hasErc20Transfer = transactionsArray.some(isErc20TransferCall)
  const hasSwap = getTransactionReviewHasSwap(transactionReview)
  return hasErc20Transfer
    ? "Review send"
    : hasSwap
    ? "Review trade"
    : transactionsArray.length === 1
    ? "Confirm transaction"
    : "Confirm transactions"
}
