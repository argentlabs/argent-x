import { KeyValueStorage } from "../storage"
import { ITransactionReviewLabelsStore } from "./interface"

export const transactionReviewLabelsStore =
  new KeyValueStorage<ITransactionReviewLabelsStore>(
    {},
    {
      namespace: "core:transactionReview:labels",
    },
  )
