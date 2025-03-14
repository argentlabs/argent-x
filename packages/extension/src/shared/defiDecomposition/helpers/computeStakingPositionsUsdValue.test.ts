import "fake-indexeddb/auto"

import { getMockWalletAccount } from "../../../../test/walletAccount.mock"
import { ArgentDatabase } from "../../idb/db"
import { stakingPositions } from "../__fixtures__/stakingPositions"
import { tokenPrices } from "../__fixtures__/tokenPrices"
import { tokens } from "../__fixtures__/tokens"
import type { ParsedStakingPosition } from "../schema"
import {
  computeStakingPositionUsdValue,
  computeStakingPositionsUsdValue,
} from "./computeStakingPositionsUsdValue"
import { parseStakingPositions } from "./parseStakingPositions"

describe("computeStakingPositionsUsdValue", () => {
  const mockAccount = getMockWalletAccount({
    address: "0x123",
    networkId: "sepolia-alpha",
  })

  let db: ArgentDatabase

  let parsedPositions: ParsedStakingPosition[] = []

  beforeEach(async () => {
    db = new ArgentDatabase()

    parsedPositions = parseStakingPositions(stakingPositions, mockAccount)
  })

  afterEach(() => {
    db.close()
    vi.clearAllMocks()
  })

  describe("computeStakingPositionUsdValue", () => {
    it("should compute USD value for a staking position", async () => {
      const result = computeStakingPositionUsdValue(
        parsedPositions[0],
        tokens,
        tokenPrices,
      )

      expect(result).toBeDefined()
      expect(result?.token.usdValue).toBeDefined()
      expect(result?.token.usdValue).not.toBe("0")
      expect(result?.token.usdValue).toEqual("45.665878811978536116099165")
      expect(result?.apy).toBe(parsedPositions[0].apy)
    })
  })

  describe("computeStakingPositionsUsdValue", () => {
    it("should compute USD value for all staking positions", async () => {
      const result = computeStakingPositionsUsdValue(
        parsedPositions,
        tokens,
        tokenPrices,
      )

      expect(result).toBeDefined()
      expect(result.totalUsdValue).toBeDefined()
      expect(result.totalUsdValue).not.toBe("0")
      expect(result.totalUsdValue).toEqual("45.665878811978536116099165")
      expect(result.positions).toHaveLength(parsedPositions.length)
      result.positions.forEach((position, index) => {
        expect(position.token.usdValue).toBeDefined()
        expect(position.token.usdValue).not.toBe("0")
        expect(position.token.usdValue).toEqual("45.665878811978536116099165")
        expect(position.apy).toBe(parsedPositions[index].apy)
      })
    })
  })
})
