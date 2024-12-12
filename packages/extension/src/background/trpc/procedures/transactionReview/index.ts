import { router } from "../../trpc"
import { getCompressedTransactionPayloadProcedure } from "./getCompressedTransactionPayload"
import { getLabelsProcedure } from "./getLabels"
import { getWarningsProcedure } from "./getWarnings"
import { simulateAndReviewProcedure } from "./simulateAndReview"

export const transactionReviewRouter = router({
  simulateAndReview: simulateAndReviewProcedure,
  getCompressedTransactionPayload: getCompressedTransactionPayloadProcedure,
  getLabels: getLabelsProcedure,
  getWarnings: getWarningsProcedure,
})
