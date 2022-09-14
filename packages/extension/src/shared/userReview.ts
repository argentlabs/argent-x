import { KeyValueStorage } from "./storage"

export interface IUserReview {
  transactionsBeforeReview: number
  hasReviewed: boolean
}

export const userReviewStore = new KeyValueStorage<IUserReview>(
  {
    transactionsBeforeReview: 2,
    hasReviewed: false,
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
