import type { BigDecimal } from "@argent/x-shared"
import { bigDecimal } from "@argent/x-shared"
import type { TokenPriceDetails } from "../../token/__new/types/tokenPrice.model"
import type {
  ParsedStrkDelegatedStakingPosition,
  ParsedStrkDelegatedStakingPositionWithUsdValue,
  ParsedStrkDelegatedStakingPositionsWithUsdValue,
} from "../schema"
import type { Token } from "../../token/__new/types/token.model"
import { computeUsdValueForPosition } from "./computeUsdValueForPosition"
import { sortDescendingByUsdValue } from "./sortDescendingByUsdValue"

export const computeStrkDelegatedStakingPositionUsdValue = (
  position: ParsedStrkDelegatedStakingPosition,
  tokens: Token[],
  tokenPrices: TokenPriceDetails[],
): ParsedStrkDelegatedStakingPositionWithUsdValue | undefined => {
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

export const computeStrkDelegatedStakingPositionsUsdValue = (
  positions: ParsedStrkDelegatedStakingPosition[],
  tokens: Token[],
  tokenPrices: TokenPriceDetails[],
): ParsedStrkDelegatedStakingPositionsWithUsdValue => {
  let totalUsdValue: BigDecimal = bigDecimal.parseUnits("0")
  const positionsWithUsdValue = positions.map((position) => {
    const positionWithUsdValue = computeStrkDelegatedStakingPositionUsdValue(
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
