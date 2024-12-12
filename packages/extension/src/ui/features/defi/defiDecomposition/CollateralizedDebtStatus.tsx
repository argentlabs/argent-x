import type { FC } from "react"
import { useMemo } from "react"
import type { ParsedCollateralizedDebtBorrowingPosition } from "../../../../shared/defiDecomposition/schema"
import { DefiPositionSubtitle } from "./DefiPositionSubtitle"
import { DefiPositionTitle } from "./DefiPositionTitle"
import { icons } from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"

const { RadioFilledIcon } = icons

interface CollateralizedDebtStatusProps {
  position: ParsedCollateralizedDebtBorrowingPosition
  isTitle?: boolean
}

export type CollateralizedDebtStatusValue =
  | "Healthy"
  | "Caution"
  | "Liquidation risks"

export const CollateralizedDebtStatus: FC<CollateralizedDebtStatusProps> = ({
  position,
  isTitle = false,
}) => {
  const { status, color } = useMemo(() => {
    if (!position?.healthRatio) {
      return { status: undefined, color: undefined }
    }
    if (+position.healthRatio < 1.5) {
      return { status: "Liquidation risks", color: "text-danger" }
    }
    if (+position.healthRatio < 2.5) {
      return { status: "Caution", color: "text-warning" }
    }
    return { status: "Healthy", color: "text-success" }
  }, [position?.healthRatio])

  if (!status || !color) {
    return null
  }

  return (
    <>
      {isTitle ? (
        <Flex alignItems="center">
          <RadioFilledIcon color={color} mr={1} />
          <DefiPositionTitle color={color}>{status}</DefiPositionTitle>
        </Flex>
      ) : (
        <DefiPositionSubtitle color={color}>{status}</DefiPositionSubtitle>
      )}
    </>
  )
}
