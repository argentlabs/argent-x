import type { FC } from "react"
import { useRouteInvestmentId } from "../../../hooks/useRoute"
import {
  useSelectedStrkDelegatedStakingInvestment,
  useStrkDelegatedStakingInvestments,
} from "./hooks/useStrkDelegatedStakingInvestments"
import { StakingScreenContainer } from "./StakingScreenContainer"

export const NativeStakingScreenContainer: FC = () => {
  const investmentId = useRouteInvestmentId()

  const [investment, , resetToDefaultInvestment] =
    useSelectedStrkDelegatedStakingInvestment(investmentId)

  const { data: investments } = useStrkDelegatedStakingInvestments()

  const showEditProvider = Boolean(
    investments && investments.length > 1 && !investmentId,
  )

  return (
    <StakingScreenContainer
      investment={investment}
      resetToDefaultInvestment={resetToDefaultInvestment}
      showEditProvider={showEditProvider}
    />
  )
}
