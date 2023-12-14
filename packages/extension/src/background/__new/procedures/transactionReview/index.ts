import { router } from "../../trpc"
import { getLabelsProcedure } from "./getLabels"
import { simulateAndReviewProcedure } from "./simulateAndReview"

export const transactionReviewRouter = router({
  simulateAndReview: simulateAndReviewProcedure,
  getLabels: getLabelsProcedure,
})
