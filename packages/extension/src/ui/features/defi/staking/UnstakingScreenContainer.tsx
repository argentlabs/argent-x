import type { FC } from "react"
import { UnstakingScreen } from "./UnstakingScreen"
import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"
import { useView } from "../../../views/implementation/react"
import { selectedAccountView } from "../../../views/account"
import { strkDelegatedStakingPositionUsdValueAtom } from "../../../views/staking"
import { useAction } from "../../../hooks/useAction"
import { stakingService } from "../../../services/staking"
import type { Address } from "@argent/x-shared"
import {
  useRouteAccountDefi,
  useRouteInvestmentPositionId,
} from "../../../hooks/useRoute"
import { useNavigate } from "react-router-dom"

export const UnstakingScreenContainer: FC = () => {
  const selectedAccount = useView(selectedAccountView)
  const onBack = useNavigateReturnToOrBack()
  const navigate = useNavigate()

  const { action: initiateUnstake, loading: withdrawLoading } = useAction(
    stakingService.initiateUnstake.bind(stakingService),
  )
  const defiRoute = useRouteAccountDefi()

  const positionId = useRouteInvestmentPositionId()

  const stakedStrkPosition = useView(
    strkDelegatedStakingPositionUsdValueAtom({
      account: selectedAccount,
      positionId,
    }),
  )

  if (!selectedAccount || !stakedStrkPosition) {
    return null
  }

  const onWithdraw = () => {
    void initiateUnstake({
      investmentId: stakedStrkPosition.position.investmentId,
      amount: stakedStrkPosition.balance.total,
      stakerInfo: stakedStrkPosition.position.stakerInfo,
      accountAddress: selectedAccount.address as Address,
      accountType: selectedAccount.type,
      tokenAddress: stakedStrkPosition.token.address,
    })

    navigate(defiRoute)
  }
  return (
    <UnstakingScreen
      onBack={onBack}
      stakerInfo={stakedStrkPosition.position.stakerInfo}
      balance={stakedStrkPosition.balance}
      usdValue={stakedStrkPosition.usdValue}
      tokenInfo={stakedStrkPosition.token}
      withdrawLoading={withdrawLoading}
      onWithdraw={onWithdraw}
    />
  )
}
