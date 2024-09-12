import { router } from "../../trpc"
import { simulateAndReviewProcedure } from "./simulateAndReview"

export const signatureReviewRouter = router({
  simulateAndReview: simulateAndReviewProcedure,
})
