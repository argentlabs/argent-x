import BackgroundTransactionReviewService from "./BackgroundTransactionReviewService"
import { walletSingleton } from "../../walletSingleton"
import { httpService } from "../../../shared/http/singleton"
import {
  transactionReviewLabelsStore,
  transactionReviewWarningsStore,
} from "../../../shared/transactionReview/store"
import { transactionReviewWorker } from "./worker"

export const backgroundTransactionReviewService =
  new BackgroundTransactionReviewService(
    walletSingleton,
    httpService,
    transactionReviewLabelsStore,
    transactionReviewWarningsStore,
    transactionReviewWorker,
  )
