import { router } from "../../trpc"
import { getCompressedTransactionPayloadProcedure } from "./getCompressedTransactionPayload"
import { getLabelsProcedure } from "./getLabels"
import { getTransactionHashProcedure } from "./getTransactionHash"
import { getWarningsProcedure } from "./getWarnings"
import { simulateAndReviewProcedure } from "./simulateAndReview"

export const transactionReviewRouter = router({
  simulateAndReview: simulateAndReviewProcedure,
  getTransactionHash: getTransactionHashProcedure,
  getCompressedTransactionPayload: getCompressedTransactionPayloadProcedure,
  getLabels: getLabelsProcedure,
  getWarnings: getWarningsProcedure,
})
