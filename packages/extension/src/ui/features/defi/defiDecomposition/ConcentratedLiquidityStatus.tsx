import { bigDecimal } from "@argent/x-shared"
import type { FC } from "react"
import { useMemo } from "react"
import type { ParsedConcentratedLiquidityPosition } from "../../../../shared/defiDecomposition/schema"
import { DefiPositionSubtitle } from "./DefiPositionSubtitle"
import { DefiPositionTitle } from "./DefiPositionTitle"

import { icons } from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"

const { RadioFilledIcon } = icons

export type ConcentratedLiquidityStatusValue = "Active" | "Inactive"

export const computeConcentratedLiquidityStatus = (
  defiPosition?: ParsedConcentratedLiquidityPosition,
) => {
  const { minPrice, maxPrice, currentPrice } = defiPosition?.token0 ?? {}
  const zero = bigDecimal.parseUnits("0")

  const numCurrentPrice = bigDecimal.parseUnits(currentPrice || "0")
  const numMinPrice = bigDecimal.parseUnits(minPrice || "0")
  const numMaxPrice = bigDecimal.parseUnits(maxPrice || "0")

  const range = bigDecimal.sub(numMaxPrice, numMinPrice)
  const correctedStartValue = bigDecimal.sub(numCurrentPrice, numMinPrice)

  if (
    bigDecimal.eq(numCurrentPrice, zero) ||
    bigDecimal.eq(range, zero) ||
    bigDecimal.eq(correctedStartValue, zero)
  ) {
    return 0
  }
  const statusPercentage = bigDecimal.div(
    bigDecimal.mul(correctedStartValue, bigDecimal.parseUnits("100")),
    range,
  )

  if (isNaN(Number(bigDecimal.formatUnits(statusPercentage)))) {
    return 0
  }

  return Number(bigDecimal.formatUnits(statusPercentage))
}

interface ConcentratedLiquidityStatusProps {
  position: ParsedConcentratedLiquidityPosition
  isTitle?: boolean
}

export const ConcentratedLiquidityStatus: FC<
  ConcentratedLiquidityStatusProps
> = ({ position: position, isTitle = false }) => {
  const statusPercentage = computeConcentratedLiquidityStatus(position)

  const status: ConcentratedLiquidityStatusValue = useMemo(
    () =>
      statusPercentage < 0 || statusPercentage > 100 ? "Inactive" : "Active",
    [statusPercentage],
  )
  const isActive = status === "Active"

  const label = isActive ? "Active" : "Inactive"
  const bgColor = useMemo(
    () =>
      isActive
        ? statusPercentage <= 10 || statusPercentage >= 90
          ? "text-warning"
          : "text-success"
        : "text-danger",
    [isActive, statusPercentage],
  )

  return (
    <>
      {isTitle ? (
        <Flex alignItems="center">
          <RadioFilledIcon color={bgColor} mr={1} />
          <DefiPositionTitle color={bgColor}>{label}</DefiPositionTitle>
        </Flex>
      ) : (
        <DefiPositionSubtitle color={bgColor}>{label}</DefiPositionSubtitle>
      )}
    </>
  )
}
