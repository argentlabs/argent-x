import type { StrkDelegatedStakingInvestment } from "@argent/x-shared"
import type { FC } from "react"
import { useCallback } from "react"

import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"
import { NativeStakingProviderSelectScreen } from "./NativeStakingProviderSelectScreen"
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
    (investment: StrkDelegatedStakingInvestment) => {
      selectInvestment(investment)
      onBack()
    },
    [onBack, selectInvestment],
  )

  return (
    <NativeStakingProviderSelectScreen
      investments={investments}
      onBack={onBack}
      onInvestmentClick={onInvestmentClick}
      isLoading={isLoading}
    />
  )
}
