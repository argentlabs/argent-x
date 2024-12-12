import type { BigDecimal } from "@argent/x-shared"
import { bigDecimal } from "@argent/x-shared"
import type { TokenPriceDetails } from "../../token/__new/types/tokenPrice.model"
import type {
  ParsedDelegatedTokensPosition,
  ParsedDelegatedTokensPositionWithUsdValue,
  ParsedDelegatedTokensPositionsWithUsdValue,
} from "../schema"
import { computeUsdValueForPosition } from "./computeUsdValueForPosition"
import type { Token } from "../../token/__new/types/token.model"
import { sortDescendingByUsdValue } from "./sortDescendingByUsdValue"

export const computeDelegatedTokensPositionUsdValue = (
  position: ParsedDelegatedTokensPosition,
  tokens: Token[],
  tokenPrices: TokenPriceDetails[],
): ParsedDelegatedTokensPositionWithUsdValue | undefined => {
  const usdValue = computeUsdValueForPosition(
    position.token,
    tokens,
    tokenPrices,
  )

  if (!usdValue) {
    return
  }

  return {
    ...position,
    token: {
      ...position.token,
      usdValue,
    },
  }
}

export const computeDelegatedTokensPositionsUsdValue = (
  positions: ParsedDelegatedTokensPosition[],
  tokens: Token[],
  tokenPrices: TokenPriceDetails[],
): ParsedDelegatedTokensPositionsWithUsdValue => {
  let totalUsdValue: BigDecimal = bigDecimal.parseUnits("0")
  const positionsWithUsdValue = positions.map((position) => {
    const positionWithUsdValue = computeDelegatedTokensPositionUsdValue(
      position,
      tokens,
      tokenPrices,
    )
    totalUsdValue = bigDecimal.add(
      totalUsdValue,
      bigDecimal.parseUnits(positionWithUsdValue?.token.usdValue || "0"),
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
