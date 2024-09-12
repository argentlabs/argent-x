import {
  transactionReviewLabelsStore,
  transactionReviewWarningsStore,
} from "../../../../shared/transactionReview/store"
import { httpService } from "../../../../shared/http/singleton"
import { backgroundUIService } from "../../ui"
import { TransactionReviewWorker } from "./TransactionReviewWorker"
import { chromeScheduleService } from "../../../../shared/schedule"
import { debounceService } from "../../../../shared/debounce"

export const transactionReviewWorker = new TransactionReviewWorker(
  transactionReviewLabelsStore,
  transactionReviewWarningsStore,
  httpService,
  backgroundUIService,
  chromeScheduleService,
  debounceService,
)
