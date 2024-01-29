import { transactionReviewLabelsStore } from "../../../../../shared/transactionReview/store"
import { httpService } from "../../../../../shared/http/singleton"
import { backgroundUIService } from "../../ui"
import { TransactionReviewWorker } from "./implementation"

export const transactionReviewWorker = new TransactionReviewWorker(
  transactionReviewLabelsStore,
  httpService,
  backgroundUIService,
)
