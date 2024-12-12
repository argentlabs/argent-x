import type { BigDecimal, Token } from "@argent/x-shared"
import { bigDecimal } from "@argent/x-shared"
import type { TokenPriceDetails } from "../../token/__new/types/tokenPrice.model"
import type {
  ParsedCollateralizedDebtBorrowingPosition,
  ParsedCollateralizedDebtBorrowingPositionWithUsdValue,
  ParsedCollateralizedDebtLendingPosition,
  ParsedCollateralizedDebtPositionsWithUsdValue,
  ParsedCollateralizedDebtPositionWithUsdValue,
} from "../schema"
import { computeUsdValueForPosition } from "./computeUsdValueForPosition"
import { sortDescendingByUsdValue } from "./sortDescendingByUsdValue"

export const computeCollateralizedDebtLendingPositionUsdValue = (
  position: ParsedCollateralizedDebtLendingPosition,
  tokens: Token[],
  tokenPrices: TokenPriceDetails[],
): ParsedCollateralizedDebtPositionWithUsdValue | undefined => {
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

export const computeCollateralizedDebtBorrowingPositionUsdValue = (
  position: ParsedCollateralizedDebtBorrowingPosition,
  tokens: Token[],
  tokenPrices: TokenPriceDetails[],
): ParsedCollateralizedDebtBorrowingPositionWithUsdValue | undefined => {
  let collateralizedPositionsTotalUsdValue: BigDecimal =
    bigDecimal.parseUnits("0")
  let debtPositionsTotalUsdValue: BigDecimal = bigDecimal.parseUnits("0")

  const collateralizedPositions = position.collateralizedPositions.map(
    (position) => {
      const collateralizedPosition =
        computeCollateralizedDebtLendingPositionUsdValue(
          position,
          tokens,
          tokenPrices,
        )
      collateralizedPositionsTotalUsdValue = bigDecimal.add(
        collateralizedPositionsTotalUsdValue,
        bigDecimal.parseUnits(collateralizedPosition?.token.usdValue || "0"),
      )
      return collateralizedPosition
    },
  )
  const debtPositions = position.debtPositions.map((position) => {
    const debtPosition = computeCollateralizedDebtLendingPositionUsdValue(
      position,
      tokens,
      tokenPrices,
    )
    debtPositionsTotalUsdValue = bigDecimal.add(
      debtPositionsTotalUsdValue,
      bigDecimal.parseUnits(debtPosition?.token.usdValue || "0"),
    )
    return debtPosition
  })

  const filteredCollateralizedPositions = collateralizedPositions.filter(
    (position) => position !== undefined,
  )

  const filteredDebtPositions = debtPositions.filter(
    (position) => position !== undefined,
  )

  if (
    !filteredCollateralizedPositions.length ||
    !filteredDebtPositions.length
  ) {
    return
  }

  const totalUsdValue: BigDecimal = bigDecimal.sub(
    collateralizedPositionsTotalUsdValue,
    debtPositionsTotalUsdValue,
  )

  return {
    ...position,
    totalUsdValue: bigDecimal.formatUnits(totalUsdValue),
    collateralizedPositionsTotalUsdValue: bigDecimal.formatUnits(
      collateralizedPositionsTotalUsdValue,
    ),
    debtPositionsTotalUsdValue: bigDecimal.formatUnits(
      debtPositionsTotalUsdValue,
    ),
    collateralizedPositions: filteredCollateralizedPositions,
    debtPositions: filteredDebtPositions,
  }
}

export const computeCollateralizedDebtLendingPositionsUsdValue = (
  positions: ParsedCollateralizedDebtLendingPosition[],
  tokens: Token[],
  tokenPrices: TokenPriceDetails[],
): ParsedCollateralizedDebtPositionsWithUsdValue => {
  let totalUsdValue: BigDecimal = bigDecimal.parseUnits("0")
  const result =
    positions
      .map((position) => {
        const lendingPosition =
          computeCollateralizedDebtLendingPositionUsdValue(
            position,
            tokens,
            tokenPrices,
          )
        totalUsdValue = bigDecimal.add(
          totalUsdValue,
          bigDecimal.parseUnits(lendingPosition?.token.usdValue || "0"),
        )
        return lendingPosition
      })
      .filter((position) => position !== undefined)
      .sort(sortDescendingByUsdValue) || []

  return {
    totalUsdValue: bigDecimal.formatUnits(totalUsdValue),
    positions: result,
  }
}

export const computeCollateralizedDebtBorrowingPositionsUsdValue = (
  positions: ParsedCollateralizedDebtBorrowingPosition[],
  tokens: Token[],
  tokenPrices: TokenPriceDetails[],
): ParsedCollateralizedDebtPositionsWithUsdValue => {
  let totalUsdValue: BigDecimal = bigDecimal.parseUnits("0")
  const result =
    positions
      .map((position) => {
        const borrowingPosition =
          computeCollateralizedDebtBorrowingPositionUsdValue(
            position,
            tokens,
            tokenPrices,
          )
        totalUsdValue = bigDecimal.add(
          totalUsdValue,
          bigDecimal.parseUnits(borrowingPosition?.totalUsdValue || "0"),
        )
        return borrowingPosition
      })
      .filter((position) => position !== undefined)
      .sort(sortDescendingByUsdValue) || []

  return {
    totalUsdValue: bigDecimal.formatUnits(totalUsdValue),
    positions: result,
  }
}
