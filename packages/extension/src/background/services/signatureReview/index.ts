import BackgroundOutsideSignatureReviewService from "./BackgroundOutsideSignatureReviewService"
import { backgroundTransactionReviewService } from "../transactionReview"

export const signatureReviewService =
  new BackgroundOutsideSignatureReviewService(
    backgroundTransactionReviewService,
  )
