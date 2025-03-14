import type { FC } from "react"
import { useMemo } from "react"
import type { ParsedCollateralizedDebtBorrowingPosition } from "../../../../shared/defiDecomposition/schema"
import { DefiPositionSubtitle } from "./DefiPositionSubtitle"
import { DefiPositionTitle } from "./DefiPositionTitle"
import { RadioFilledIcon } from "@argent/x-ui/icons"
import { Label2 } from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"

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

  const description = useMemo(() => {
    if (position?.healthRatio && +position.healthRatio < 2.5) {
      return "Supply more collateral or repay debt to avoid liquidation"
    }
    return ""
  }, [position?.healthRatio])

  if (!status || !color) {
    return null
  }

  return (
    <>
      {isTitle ? (
        <>
          <Flex alignItems="center">
            <RadioFilledIcon color={color} mr={1} />
            <DefiPositionTitle color={color}>{status}</DefiPositionTitle>
          </Flex>
          <Label2 width="156px" color="text-secondary" textAlign="right">
            {description}
          </Label2>
        </>
      ) : (
        <DefiPositionSubtitle color={color}>{status}</DefiPositionSubtitle>
      )}
    </>
  )
}
