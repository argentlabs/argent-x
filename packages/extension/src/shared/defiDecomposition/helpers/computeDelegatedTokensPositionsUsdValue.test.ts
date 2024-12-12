import "fake-indexeddb/auto"

import { getMockAccount } from "../../../../test/account.mock"
import { ArgentDatabase } from "../../idb/db"
import { delegatedTokensPositions } from "../__fixtures__/delegatedTokensPositions"
import { tokenPrices } from "../__fixtures__/tokenPrices"
import { tokens } from "../__fixtures__/tokens"
import type { ParsedDelegatedTokensPosition } from "../schema"
import {
  computeDelegatedTokensPositionUsdValue,
  computeDelegatedTokensPositionsUsdValue,
} from "./computeDelegatedTokensPositionsUsdValue"
import { parseDelegatedTokensPositions } from "./parseDelegatedTokensPositions"

describe("computeDelegatedTokensPositionsUsdValue", () => {
  const mockAccount = getMockAccount({
    address: "0x123",
    networkId: "sepolia-alpha",
  })

  let db: ArgentDatabase

  let parsedPositions: ParsedDelegatedTokensPosition[] = []

  beforeEach(async () => {
    db = new ArgentDatabase()

    parsedPositions = parseDelegatedTokensPositions(
      delegatedTokensPositions,
      mockAccount,
    )
  })

  afterEach(() => {
    db.close()
    vi.clearAllMocks()
  })

  describe("computeDelegatedTokensPositionUsdValue", () => {
    it("should compute USD value for a delegated tokens position", () => {
      const result = computeDelegatedTokensPositionUsdValue(
        parsedPositions[0],
        tokens,
        tokenPrices,
      )

      expect(result?.token.usdValue).toBeDefined()
      expect(result?.token.usdValue).not.toBe("0")
      expect(result?.token.usdValue).toEqual("1.050005476669488196418579885")
      expect(result?.delegatingTo).toBe(parsedPositions[0].delegatingTo)
    })
  })

  describe("computeDelegatedTokensPositionsUsdValue", () => {
    it("should compute USD value for all delegated tokens positions", async () => {
      const result = computeDelegatedTokensPositionsUsdValue(
        parsedPositions,
        tokens,
        tokenPrices,
      )
      expect(result).toBeDefined()
      expect(result.totalUsdValue).toBeDefined()
      expect(result.totalUsdValue).not.toBe("0")
      expect(result.totalUsdValue).toEqual("1.108371443348036103802594379")
      expect(result.positions).toHaveLength(parsedPositions.length)
      result.positions.forEach((position, index) => {
        expect(position.token.usdValue).toBeDefined()
        expect(position.token.usdValue).not.toBe("0")
        if (index === 0) {
          expect(position.token.usdValue).toEqual(
            "1.050005476669488196418579885",
          )
        } else if (index === 1) {
          expect(position.token.usdValue).toEqual(
            "0.058365966678547907384014494",
          )
        }
        expect(position.delegatingTo).toBe(parsedPositions[index].delegatingTo)
      })
    })
  })
})
