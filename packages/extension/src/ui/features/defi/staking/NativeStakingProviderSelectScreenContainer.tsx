import type {
  LiquidStakingInvestment,
  StrkDelegatedStakingInvestment,
} from "@argent/x-shared"
import type { FC } from "react"
import { useCallback } from "react"

import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"
import { StakingProviderSelectScreen } from "./StakingProviderSelectScreen"
import {
  useSelectedStrkDelegatedStakingInvestment,
  useStrkDelegatedStakingInvestments,
} from "./hooks/useStrkDelegatedStakingInvestments"

export const NativeStakingProviderSelectScreenContainer: FC = () => {
  const onBack = useNavigateReturnToOrBack()

  const { data: investments, isValidating } =
    useStrkDelegatedStakingInvestments()
  const isLoading = investments === undefined && isValidating

  const [, selectInvestment] = useSelectedStrkDelegatedStakingInvestment()
  const onInvestmentClick = useCallback(
    (investment: StrkDelegatedStakingInvestment | LiquidStakingInvestment) => {
      if (investment.category !== "strkDelegatedStaking") {
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
