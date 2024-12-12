import type { FC } from "react"

import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"
import { LiquidStakingProviderSelectScreen } from "./LiquidStakingProviderSelectScreen"

export const LiquidStakingProviderSelectScreenContainer: FC = () => {
  const onBack = useNavigateReturnToOrBack()

  return <LiquidStakingProviderSelectScreen onBack={onBack} />
}
