import { describe, expect, it } from "vitest"
import { parsedPositionsWithUsdValue } from "../../../../shared/defiDecomposition/__fixtures__/parsedDefiDecompositionWithUsdValue"
import { computeConcentratedLiquidityStatus } from "./ConcentratedLiquidityStatus"
import type { ParsedConcentratedLiquidityPosition } from "../../../../shared/defiDecomposition/schema"

describe("computeConcentratedLiquidityStatus", () => {
  const concentratedLiquidityPosition = parsedPositionsWithUsdValue[3]
    .products[0].positions[1] as ParsedConcentratedLiquidityPosition

  it("should compute the correct status percentage for a valid position", () => {
    const result = computeConcentratedLiquidityStatus(
      concentratedLiquidityPosition,
    )
    expect(result).toBe(144.858677)
  })

  it("should return 0 when currentPrice is 0", () => {
    const modifiedPosition = {
      ...concentratedLiquidityPosition,
      token0: { ...concentratedLiquidityPosition.token0, currentPrice: "0" },
    }
    const result = computeConcentratedLiquidityStatus(modifiedPosition)
    expect(result).toBe(0)
  })

  it("should return 0 when range is 0", () => {
    const modifiedPosition = {
      ...concentratedLiquidityPosition,
      token0: {
        ...concentratedLiquidityPosition.token0,
        minPrice: "100",
        maxPrice: "100",
      },
    }
    const result = computeConcentratedLiquidityStatus(modifiedPosition)
    expect(result).toBe(0)
  })

  it("should return 0 when correctedStartValue is 0", () => {
    const modifiedPosition = {
      ...concentratedLiquidityPosition,
      token0: {
        ...concentratedLiquidityPosition.token0,
        currentPrice: "100",
        minPrice: "100",
      },
    }
    const result = computeConcentratedLiquidityStatus(modifiedPosition)
    expect(result).toBe(0)
  })

  it("should return 0 when defiPosition is undefined", () => {
    const result = computeConcentratedLiquidityStatus(undefined)
    expect(result).toBe(0)
  })

  it("should return 100 when current price is at max price", () => {
    const modifiedPosition = {
      ...concentratedLiquidityPosition,
      token0: {
        ...concentratedLiquidityPosition.token0,
        currentPrice: concentratedLiquidityPosition.token0.maxPrice,
      },
    }
    const result = computeConcentratedLiquidityStatus(modifiedPosition)
    expect(result).toBe(100)
  })

  it("should return 0 when current price is at min price", () => {
    const modifiedPosition = {
      ...concentratedLiquidityPosition,
      token0: {
        ...concentratedLiquidityPosition.token0,
        currentPrice: concentratedLiquidityPosition.token0.minPrice,
      },
    }
    const result = computeConcentratedLiquidityStatus(modifiedPosition)
    expect(result).toBe(0)
  })
})
