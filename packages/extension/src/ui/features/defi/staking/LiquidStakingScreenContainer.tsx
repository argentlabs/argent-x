import type { FC } from "react"
import { useRouteInvestmentId } from "../../../hooks/useRoute"
import {
  useSelectedLiquidStakingInvestment,
  useStrkLiquidStakingInvestments,
} from "./hooks/useStrkLiquidStakingInvestments"
import { StakingScreenContainer } from "./StakingScreenContainer"

export const LiquidStakingScreenContainer: FC = () => {
  const investmentId = useRouteInvestmentId()

  const [investment, , resetToDefaultInvestment] =
    useSelectedLiquidStakingInvestment(investmentId)

  const { data: investments } = useStrkLiquidStakingInvestments()

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
