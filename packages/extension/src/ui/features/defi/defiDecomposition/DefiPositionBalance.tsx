import { prettifyCurrencyValue } from "@argent/x-shared"
import type { FC } from "react"
import { memo } from "react"
import type { ParsedPositionWithUsdValue } from "../../../../shared/defiDecomposition/schema"
import {
  isCollateralizedDebtBorrowingPosition,
  isCollateralizedDebtLendingPosition,
  isConcentratedLiquidityPosition,
  isDelegatedTokensPosition,
  isStakingPosition,
  isStrkDelegatedStakingPosition,
} from "../../../../shared/defiDecomposition/schema"
import { DefiPositionSubtitle } from "./DefiPositionSubtitle"
import { DefiPositionTitle } from "./DefiPositionTitle"
import { useTokenAmountToCcyCallback } from "../../../hooks/useTokenAmountToCcyCallback"
import { checkHasRewards } from "../../../../shared/staking/utils"

interface DefiPositionBalanceChangeProps {
  position: ParsedPositionWithUsdValue
}

const DefiPositionBalanceRaw: FC<DefiPositionBalanceChangeProps> = ({
  position,
}) => {
  let amount = "0"
  let nrOfAssets = 0
  let rewards = "0"

  const tokenAmountToCcyValueCallback = useTokenAmountToCcyCallback()

  if (isStrkDelegatedStakingPosition(position)) {
    amount = tokenAmountToCcyValueCallback(
      position.token,
      position.stakedAmount,
    )
    rewards = tokenAmountToCcyValueCallback(
      position.token,
      position.accruedRewards,
    )
    nrOfAssets = 1
  } else if (
    isStakingPosition(position) ||
    isDelegatedTokensPosition(position) ||
    isCollateralizedDebtLendingPosition(position)
  ) {
    amount = position.token.usdValue
    nrOfAssets = 1
  } else if (isConcentratedLiquidityPosition(position)) {
    amount = position.totalUsdValue
    nrOfAssets = 2
  } else if (isCollateralizedDebtBorrowingPosition(position)) {
    amount = position.totalUsdValue
    nrOfAssets =
      position.debtPositions.length + position.collateralizedPositions.length
  }
  const displayValue = prettifyCurrencyValue(amount)

  return (
    <>
      <DefiPositionTitle data-value={displayValue}>
        {displayValue}
      </DefiPositionTitle>
      {nrOfAssets > 1 && (
        <DefiPositionSubtitle>{nrOfAssets} assets</DefiPositionSubtitle>
      )}
      {checkHasRewards(rewards) && (
        <DefiPositionSubtitle data-value={rewards} color="text-success">
          +{prettifyCurrencyValue(rewards)}
        </DefiPositionSubtitle>
      )}
    </>
  )
}

const DefiPositionBalance = memo(DefiPositionBalanceRaw)

export { DefiPositionBalance }
