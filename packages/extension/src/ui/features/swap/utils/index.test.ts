import {
  isETH,
  maxAmountSpendFromTokenBalance,
  maxAmountSpend,
  bipsToPercent,
} from "./index"
import { BaseToken } from "../../../../shared/token/__new/types/token.model"
import { MIN_ETH } from "./constants"
import { ETH, USDC } from "../../../../shared/token/__new/constants"
import { constants } from "starknet"
import { getMockBaseToken, getMockToken } from "../../../../../test/token.mock"

describe("swap utils", () => {
  describe("isETH", () => {
    it("should return true if the token is ETH", () => {
      const token: BaseToken = {
        ...ETH[constants.StarknetChainId.SN_MAIN],
      }
      expect(isETH(token)).toBe(true)
    })

    it("should return false if the token is not ETH", () => {
      const token: BaseToken = {
        ...USDC[constants.StarknetChainId.SN_MAIN],
      }
      expect(isETH(token)).toBe(false)
    })
  })

  describe("maxAmountSpendFromTokenBalance", () => {
    it("should return undefined if tokenBalance is not provided", () => {
      expect(maxAmountSpendFromTokenBalance(undefined)).toBeUndefined()
    })

    it("should return undefined if tokenBalance has no balance", () => {
      const tokenBalance = {
        ...getMockToken(),
        balance: undefined,
      }
      expect(maxAmountSpendFromTokenBalance(tokenBalance)).toBeUndefined()
    })

    it("should return the correct max amount spendable", () => {
      const tokenBalance = {
        balance: 100000000000000000n,
        ...getMockToken(),
      }
      expect(maxAmountSpendFromTokenBalance(tokenBalance)).toBe(
        tokenBalance.balance,
      )
    })
  })

  describe("maxAmountSpend", () => {
    it("should return undefined if tokenAmount is not provided", () => {
      expect(maxAmountSpend(undefined)).toBeUndefined()
    })

    it("should return the full amount if the token is not ETH", () => {
      const tokenAmount = {
        amount: 100000000000000000n,
        ...getMockBaseToken(),
      }
      expect(maxAmountSpend(tokenAmount)).toBe(tokenAmount.amount)
    })

    it("should return the amount minus MIN_ETH if the token is ETH and amount is greater than MIN_ETH", () => {
      const tokenAmount = {
        amount: 100000000000000000n,
        ...ETH[constants.StarknetChainId.SN_MAIN],
      }
      expect(maxAmountSpend(tokenAmount)).toBe(tokenAmount.amount - MIN_ETH)
    })

    it("should return 0 if the token is ETH and amount is less than or equal to MIN_ETH", () => {
      const tokenAmount = {
        amount: MIN_ETH,
        ...ETH[constants.StarknetChainId.SN_MAIN],
      }
      expect(maxAmountSpend(tokenAmount)).toBe(0n)
    })
  })

  describe("bipsToPercent", () => {
    it("should convert bips to percent correctly", () => {
      const bips = 100 // 1%
      const percent = bipsToPercent(bips)
      expect(percent.value).toBe(BigInt(1))
      expect(percent.decimals).toBe(2)
    })
  })
})
