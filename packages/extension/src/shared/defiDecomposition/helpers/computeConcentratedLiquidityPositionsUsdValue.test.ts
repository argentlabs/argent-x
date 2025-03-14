import { getMockWalletAccount } from "../../../../test/walletAccount.mock"
import { concentratedLiquidityPositions } from "../__fixtures__/concentratedLiquidityPositions"
import { tokenPrices } from "../__fixtures__/tokenPrices"
import { tokens } from "../__fixtures__/tokens"
import type { ParsedConcentratedLiquidityPosition } from "../schema"
import {
  computeConcentratedLiquidityPositionUsdValue,
  computeConcentratedLiquidityPositionsUsdValue,
} from "./computeConcentratedLiquidityPositionsUsdValue"
import { parseConcentratedLiquidityPositions } from "./parseConcentratedLiquidityPositions"

describe("computeConcentratedLiquidityPositionsUsdValue", async () => {
  const mockAccount = getMockWalletAccount({
    address: "0x123",
    networkId: "sepolia-alpha",
  })

  let parsedPositions: ParsedConcentratedLiquidityPosition[] = []

  beforeEach(async () => {
    parsedPositions = parseConcentratedLiquidityPositions(
      concentratedLiquidityPositions,
      mockAccount,
      tokens,
    )
  })

  afterEach(async () => {
    vi.clearAllMocks()
  })

  describe("computeConcentratedLiquidityPositionUsdValue", () => {
    it("should compute USD value for a concentrated liquidity position", async () => {
      const result = computeConcentratedLiquidityPositionUsdValue(
        parsedPositions[0],
        tokens,
        tokenPrices,
      )

      expect(result).toBeDefined()
      expect(result?.totalUsdValue).toBeDefined()
      expect(result?.totalUsdValue).not.toBe("0")
      expect(result?.totalUsdValue).toEqual("3307.479470840947961037742657972")
      expect(result?.token0.usdValue).toBeDefined()
      expect(result?.token1.usdValue).toBeDefined()
      expect(result?.token0.usdValue).toEqual(
        "3307.450373613730023165357627972",
      )
      expect(result?.token1.usdValue).toEqual("0.02909722721793787238503")
    })
  })

  describe("computeConcentratedLiquidityPositionsUsdValue", () => {
    it("should compute USD value for all concentrated liquidity positions", async () => {
      const result = computeConcentratedLiquidityPositionsUsdValue(
        parsedPositions,
        tokens,
        tokenPrices,
      )

      expect(result).toBeDefined()
      expect(result.totalUsdValue).toBeDefined()
      expect(result.totalUsdValue).not.toBe("0")
      expect(result.totalUsdValue).toEqual("3307.895989919979541010882232535")
      expect(result.positions).toHaveLength(2)
      expect(result.positions[0].totalUsdValue).toBeDefined()
      expect(result.positions[0].totalUsdValue).toEqual(
        "3307.479470840947961037742657972",
      )
      expect(result.positions[0].token0.usdValue).toBeDefined()
      expect(result.positions[0].token1.usdValue).toBeDefined()
      expect(result.positions[0].token0.usdValue).toEqual(
        "3307.450373613730023165357627972",
      )
      expect(result.positions[0].token1.usdValue).toEqual(
        "0.02909722721793787238503",
      )
      expect(result.positions[1].totalUsdValue).toBeDefined()
      expect(result.positions[1].totalUsdValue).toEqual(
        "0.416519079031579973139574563",
      )
      expect(result.positions[1].token0.usdValue).toBeDefined()
      expect(result.positions[1].token1.usdValue).toBeDefined()
      expect(result.positions[1].token0.usdValue).toEqual(
        "0.41651906300024110610247",
      )
      expect(result.positions[1].token1.usdValue).toEqual(
        "0.000000016031338867037104563",
      )
    })
  })
})
