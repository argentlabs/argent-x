import type { BigDecimal } from "@argent/x-shared"
import { bigDecimal } from "@argent/x-shared"
import type { TokenPriceDetails } from "../../token/__new/types/tokenPrice.model"
import type {
  ParsedConcentratedLiquidityPosition,
  ParsedConcentratedLiquidityPositionWithUsdValue,
  ParsedConcentratedLiquidityPositionsWithUsdValue,
} from "../schema"
import type { Token } from "../../token/__new/types/token.model"
import { computeUsdValueForPosition } from "./computeUsdValueForPosition"
import { sortDescendingByUsdValue } from "./sortDescendingByUsdValue"

export const computeConcentratedLiquidityPositionUsdValue = (
  position: ParsedConcentratedLiquidityPosition,
  tokens: Token[],
  tokenPrices: TokenPriceDetails[],
): ParsedConcentratedLiquidityPositionWithUsdValue | undefined => {
  const { token0, token1 } = position
  const token0UsdValue = computeUsdValueForPosition(
    position.token0,
    tokens,
    tokenPrices,
  )
  const token1UsdValue = computeUsdValueForPosition(
    position.token1,
    tokens,
    tokenPrices,
  )

  if (!token0UsdValue || !token1UsdValue) {
    return
  }

  const totalUsdValue = bigDecimal.add(
    bigDecimal.parseUnits(token0UsdValue),
    bigDecimal.parseUnits(token1UsdValue),
  )

  return {
    ...position,
    totalUsdValue: bigDecimal.formatUnits(totalUsdValue),
    token0: { ...token0, usdValue: token0UsdValue },
    token1: { ...token1, usdValue: token1UsdValue },
  }
}

export const computeConcentratedLiquidityPositionsUsdValue = (
  positions: ParsedConcentratedLiquidityPosition[],
  tokens: Token[],
  tokenPrices: TokenPriceDetails[],
): ParsedConcentratedLiquidityPositionsWithUsdValue => {
  let totalUsdValue: BigDecimal = bigDecimal.parseUnits("0")
  const positionsWithUsdValue = positions.map((position) => {
    const positionWithUsdValue = computeConcentratedLiquidityPositionUsdValue(
      position,
      tokens,
      tokenPrices,
    )
    totalUsdValue = bigDecimal.add(
      totalUsdValue,
      bigDecimal.parseUnits(positionWithUsdValue?.totalUsdValue || "0"),
    )
    return positionWithUsdValue
  })

  return {
    totalUsdValue: bigDecimal.formatUnits(totalUsdValue),
    positions: positionsWithUsdValue
      .filter((position) => position !== undefined)
      .sort(sortDescendingByUsdValue),
  }
}
