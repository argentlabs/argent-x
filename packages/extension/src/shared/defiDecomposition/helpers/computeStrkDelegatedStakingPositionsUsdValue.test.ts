import { getMockAccount } from "../../../../test/account.mock"
import { strkDelegatedStakingPositions } from "../__fixtures__/strkDelegatedStakingPositions"
import { tokenPrices } from "../__fixtures__/tokenPrices"
import { tokens } from "../__fixtures__/tokens"
import type { ParsedStrkDelegatedStakingPosition } from "../schema"
import {
  computeStrkDelegatedStakingPositionUsdValue,
  computeStrkDelegatedStakingPositionsUsdValue,
} from "./computeStrkDelegatedStakingPositionsUsdValue"
import { parseStrkDelegatedStakingPositions } from "./parseStrkDelegatedStakingPositions"

describe("computeStrkDelegatedStakingPositionsUsdValue", () => {
  const mockAccount = getMockAccount({
    address: "0x123",
    networkId: "sepolia-alpha",
  })

  let parsedPositions: ParsedStrkDelegatedStakingPosition[] = []

  beforeEach(async () => {
    parsedPositions = parseStrkDelegatedStakingPositions(
      strkDelegatedStakingPositions,
      mockAccount,
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("computeStrkDelegatedStakingPositionUsdValue", () => {
    it("should compute USD value for a STRK delegated staking position", async () => {
      const result = computeStrkDelegatedStakingPositionUsdValue(
        parsedPositions[0],
        tokens,
        tokenPrices,
      )

      expect(result).toBeDefined()
      expect(result?.token.usdValue).toBeDefined()
      expect(result?.token.usdValue).not.toBe("0")
      expect(result?.token.usdValue).toEqual("0.0198765430112345679")
      expect(result?.apy).toBe(parsedPositions[0].apy)
      expect(result?.stakerInfo).toEqual(parsedPositions[0].stakerInfo)
      expect(result?.accruedRewards).toBe(parsedPositions[0].accruedRewards)
    })
  })

  describe("computeStrkDelegatedStakingPositionsUsdValue", () => {
    it("should compute USD value for all STRK delegated staking positions", async () => {
      const result = computeStrkDelegatedStakingPositionsUsdValue(
        parsedPositions,
        tokens,
        tokenPrices,
      )
      expect(result).toBeDefined()
      expect(result.totalUsdValue).toBeDefined()
      expect(result.totalUsdValue).not.toBe("0")
      expect(result.totalUsdValue).toEqual("0.0198765430112345679")
      expect(result.positions).toHaveLength(parsedPositions.length)
      result.positions.forEach((position, index) => {
        expect(position.token.usdValue).toBeDefined()
        expect(position.token.usdValue).not.toBe("0")
        if (index === 0) {
          expect(position.token.usdValue).toEqual("0.0198765430112345679")
        }
        expect(position.apy).toBe(parsedPositions[index].apy)
        expect(position.stakerInfo).toEqual(parsedPositions[index].stakerInfo)
        expect(position.accruedRewards).toBe(
          parsedPositions[index].accruedRewards,
        )
      })
    })
  })
})
