/* eslint-disable @typescript-eslint/ban-ts-comment */
import send from "./transactionReview/__fixtures__/send.json"
import swap from "./transactionReview/__fixtures__/swap.json"
import sendNft from "./transactionReview/__fixtures__/send-nft.json"
import {
  getReviewOfTransaction,
  getTransactionActionByType,
  getTransactionReviewPropertyByType,
  getTransactionReviewSwapToken,
  transactionReviewHasNft,
  transactionReviewHasSwap,
  transactionReviewHasTransfer,
} from "./transactionReview.service"

describe("transactionReviewService", () => {
  describe("getReviewOfTransaction", () => {
    it("should return review of transaction", () => {
      // @ts-ignore
      const result = getReviewOfTransaction(send)
      expect(result).toBeDefined()
    })

    it("should return undefined for bad input", () => {
      expect(getReviewOfTransaction(undefined)).toBeUndefined()
      // @ts-ignore
      expect(getReviewOfTransaction({})).toBeUndefined()
      expect(getReviewOfTransaction({ transactions: [] })).toBeUndefined()
      // @ts-ignore
      expect(getReviewOfTransaction({ transactions: [{}] })).toBeUndefined()
    })
  })

  describe("transactionReviewHasTransfer", () => {
    it("should return transaction review is transfer", () => {
      const result = transactionReviewHasTransfer(
        // @ts-ignore
        getReviewOfTransaction(send),
      )
      expect(result).toBe(true)
    })

    it("should return transaction review is not transfer", () => {
      const result = transactionReviewHasTransfer(
        // @ts-ignore
        getReviewOfTransaction(swap),
      )
      expect(result).toBe(false)
    })
  })

  describe("transactionReviewHasSwap", () => {
    it("should return transaction review is swap", () => {
      const result = transactionReviewHasSwap(
        // @ts-ignore
        getReviewOfTransaction(swap),
      )
      expect(result).toBe(true)
    })

    it("should return transaction review is not swap", () => {
      const result = transactionReviewHasSwap(
        // @ts-ignore
        getReviewOfTransaction(send),
      )
      expect(result).toBe(false)
    })
  })

  describe("transactionReviewHasNft", () => {
    it("should return transaction review has nft", () => {
      const result = transactionReviewHasNft(
        // @ts-ignore
        getReviewOfTransaction(sendNft),
      )
      expect(result).toBe(true)
    })

    it("should return transaction review does not have nft", () => {
      const result = transactionReviewHasNft(
        // @ts-ignore
        getReviewOfTransaction(send),
      )
      expect(result).toBe(false)
    })
  })

  describe("getTransactionActionByType", () => {
    it("should return action by type", () => {
      const action = getTransactionActionByType(
        "ERC20_transfer",
        // @ts-ignore
        getReviewOfTransaction(send),
      )
      expect(action).toBeDefined()
      expect(action?.name).toBe("ERC20_transfer")
    })

    it("should return undefined for action with incorrect type", () => {
      const action = getTransactionActionByType(
        "test",
        // @ts-ignore
        getReviewOfTransaction(send),
      )
      expect(action).toBeUndefined()
    })
  })

  describe("getTransactionReviewPropertyByType", () => {
    it("should return review property by type", () => {
      const property = getTransactionReviewPropertyByType(
        "token_address",
        // @ts-ignore
        getReviewOfTransaction(send),
      )
      expect(property).toBeDefined()
      expect(property?.type).toBe("token_address")
    })

    it("should return undefined for property with incorrect type", () => {
      const property = getTransactionReviewPropertyByType(
        "test",
        // @ts-ignore
        getReviewOfTransaction(send),
      )
      expect(property).toBeUndefined()
    })
  })

  describe("getTransactionReviewSwapToken", () => {
    it("should return swap token by type", () => {
      // @ts-ignore
      const srcToken = getTransactionReviewSwapToken(swap, true)
      // @ts-ignore
      const dstToken = getTransactionReviewSwapToken(swap, false)

      expect(srcToken).toBeDefined()
      expect(dstToken).toBeDefined()
      expect(srcToken?.symbol).toBe("ETH")
      expect(dstToken?.symbol).toBe("DAI")
    })

    it("should not return destination token for transfer", () => {
      // @ts-ignore
      const srcToken = getTransactionReviewSwapToken(send, true)
      // @ts-ignore
      const dstToken = getTransactionReviewSwapToken(send, false)

      expect(srcToken).toBeDefined()
      expect(dstToken).toBeUndefined()
      expect(srcToken?.symbol).toBe("ETH")
    })
  })
})
