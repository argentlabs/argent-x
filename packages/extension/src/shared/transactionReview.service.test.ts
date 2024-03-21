import send from "./transactionReview/__fixtures__/send.json"
import swap from "./transactionReview/__fixtures__/swap.json"
import {
  transactionReviewHasSwap,
  transactionReviewHasTransfer,
} from "./transactionReview.service"

describe("transactionReviewService", () => {
  it("should return transaction review is transfer", () => {
    const result = transactionReviewHasTransfer(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      send.transactions[0].reviewOfTransaction,
    )
    expect(result).toBe(true)
  })

  it("should return transaction review is not transfer", () => {
    const result = transactionReviewHasTransfer(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      swap.transactions[0].reviewOfTransaction,
    )
    expect(result).toBe(false)
  })

  it("should return transaction review is swap", () => {
    const result = transactionReviewHasSwap(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      swap.transactions[0].reviewOfTransaction,
    )
    expect(result).toBe(true)
  })

  it("should return transaction review is not swap", () => {
    const result = transactionReviewHasSwap(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      send.transactions[0].reviewOfTransaction,
    )
    expect(result).toBe(false)
  })
})
