import { KeyValueStorage } from "./storage"

export interface IUserReview {
  transactionsBeforeReview: number
  hasReviewed: boolean
  dismissCount: number
}

export const userReviewStore = new KeyValueStorage<IUserReview>(
  {
    transactionsBeforeReview: 2,
    hasReviewed: false,
    dismissCount: 0,
  },
  "misc:userReview",
)

export const decrementTransactionsBeforeReview = async () => {
  const transactions = await userReviewStore.get("transactionsBeforeReview")

  if (transactions > 0) {
    await userReviewStore.set("transactionsBeforeReview", transactions - 1)
  }
}

export const toggleUserHasReviewed = async () => {
  await userReviewStore.set("hasReviewed", true)
}

export const resetTransactionsBeforeReview = async () => {
  const dismissCount = await userReviewStore.get("dismissCount")

  await userReviewStore.set(
    "transactionsBeforeReview",
    dismissCount === 0 ? 15 : -1, // Setting -1 so as to never show the feedback screen again
  )

  await userReviewStore.set("dismissCount", dismissCount + 1)
}
