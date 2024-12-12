import { KeyValueStorage } from "../storage"
import type {
  ITransactionReviewLabelsStore,
  ITransactionReviewWarningsStore,
} from "./interface"

export const transactionReviewLabelsStore =
  new KeyValueStorage<ITransactionReviewLabelsStore>(
    {},
    {
      namespace: "core:transactionReview:labels",
    },
  )

export const transactionReviewWarningsStore =
  new KeyValueStorage<ITransactionReviewWarningsStore>(
    {},
    {
      namespace: "core:transactionReview:warnings",
    },
  )
