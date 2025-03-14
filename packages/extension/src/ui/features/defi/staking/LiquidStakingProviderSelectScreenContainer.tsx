import { useCallback, type FC } from "react"

import type {
  LiquidStakingInvestment,
  StrkDelegatedStakingInvestment,
} from "@argent/x-shared"
import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"
import { StakingProviderSelectScreen } from "./StakingProviderSelectScreen"
import {
  useSelectedLiquidStakingInvestment,
  useStrkLiquidStakingInvestments,
} from "./hooks/useStrkLiquidStakingInvestments"

export const LiquidStakingProviderSelectScreenContainer: FC = () => {
  const onBack = useNavigateReturnToOrBack()

  const { data: investments, isValidating } = useStrkLiquidStakingInvestments()
  const isLoading = investments === undefined && isValidating

  const [, selectInvestment] = useSelectedLiquidStakingInvestment()

  const onInvestmentClick = useCallback(
    (investment: LiquidStakingInvestment | StrkDelegatedStakingInvestment) => {
      if (investment.category !== "staking") {
        return
      }
      selectInvestment(investment)
      onBack()
    },
    [onBack, selectInvestment],
  )

  return (
    <StakingProviderSelectScreen
      investments={investments}
      onBack={onBack}
      onInvestmentClick={onInvestmentClick}
      isLoading={isLoading}
    />
  )
}
