import { KeyValueStorage } from "./storage"

export const miscStore = new KeyValueStorage<{
  transactionsBeforeReview: number
}>(
  {
    transactionsBeforeReview: 2,
  },
  "core:misc",
)

export const decrementTransactionsBeforeReview = async () => {
  const transactions = await miscStore.get("transactionsBeforeReview")

  if (transactions > 0) {
    await miscStore.set("transactionsBeforeReview", transactions - 1)
  }
}
