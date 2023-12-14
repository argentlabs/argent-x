import BackgroundTransactionReviewService from "./background"
import { walletSingleton } from "../../../walletSingleton"
import { httpService } from "../http/singleton"
import { transactionReviewLabelsStore } from "../../../../shared/transactionReview/store"
import { transactionReviewWorker } from "./worker"

export const backgroundTransactionReviewService =
  new BackgroundTransactionReviewService(
    walletSingleton,
    httpService,
    transactionReviewLabelsStore,
    transactionReviewWorker,
  )
