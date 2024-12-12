import type { FC } from "react"
import type { ParsedPositionWithUsdValue } from "../../../../shared/defiDecomposition/schema"
import {
  isCollateralizedDebtBorrowingPosition,
  isConcentratedLiquidityPosition,
  isStrkDelegatedStakingPosition,
} from "../../../../shared/defiDecomposition/schema"
import { CollateralizedDebtStatus } from "./CollateralizedDebtStatus"
import { ConcentratedLiquidityStatus } from "./ConcentratedLiquidityStatus"
import { StrkDelegatedStakingStatus } from "./StrkDelegatedStakingStatus"

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
  return
}
