import type { FC } from "react"
import type { ParsedPositionWithUsdValue } from "../../../../shared/defiDecomposition/schema"
import {
  isCollateralizedDebtBorrowingPosition,
  isConcentratedLiquidityPosition,
  isStakingPosition,
  isStrkDelegatedStakingPosition,
} from "../../../../shared/defiDecomposition/schema"
import { CollateralizedDebtStatus } from "./CollateralizedDebtStatus"
import { ConcentratedLiquidityStatus } from "./ConcentratedLiquidityStatus"
import { StrkDelegatedStakingStatus } from "./StrkDelegatedStakingStatus"
import { StrkStakingStatus } from "./StrkStakingStatus"

interface DefiPositionDescriptionProps {
  position: ParsedPositionWithUsdValue
  networkId: string
}

export const DefiPositionDescription: FC<DefiPositionDescriptionProps> = ({
  position,
}) => {
  if (isConcentratedLiquidityPosition(position)) {
    return <ConcentratedLiquidityStatus position={position} />
  }
  if (isCollateralizedDebtBorrowingPosition(position)) {
    return <CollateralizedDebtStatus position={position} />
  }
  if (isStrkDelegatedStakingPosition(position)) {
    return <StrkDelegatedStakingStatus position={position} />
  }
  if (isStakingPosition(position)) {
    return <StrkStakingStatus position={position} />
  }
  return
}
