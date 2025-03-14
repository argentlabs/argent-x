import type { Address } from "@argent/x-shared"
import type { FC } from "react"
import { useAction } from "../../../hooks/useAction"
import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"
import { useRouteInvestmentPositionId } from "../../../hooks/useRoute"
import { stakingService } from "../../../services/staking"
import { selectedAccountView } from "../../../views/account"
import { useView } from "../../../views/implementation/react"
import { strkDelegatedStakingPositionUsdValueAtom } from "../../../views/staking"
import { UnstakingScreen } from "./UnstakingScreen"

export const NativeUnstakingScreenContainer: FC = () => {
  const selectedAccount = useView(selectedAccountView)
  const onBack = useNavigateReturnToOrBack()

  const { action: initiateUnstake, loading: withdrawLoading } = useAction(
    stakingService.initiateUnstake.bind(stakingService),
  )

  const positionId = useRouteInvestmentPositionId()

  const stakedStrkPosition = useView(
    strkDelegatedStakingPositionUsdValueAtom({
      account: selectedAccount,
      positionId,
    }),
  )

  if (
    !selectedAccount ||
    !stakedStrkPosition ||
    !stakedStrkPosition.position.investmentId
  ) {
    return null
  }

  const onWithdraw = () => {
    if (!stakedStrkPosition.position.investmentId) {
      return
    }

    void initiateUnstake({
      investmentId: stakedStrkPosition.position.investmentId,
      amount: stakedStrkPosition.balance.total,
      stakerInfo: stakedStrkPosition.position.stakerInfo,
      accountAddress: selectedAccount.address as Address,
      accountType: selectedAccount.type,
      tokenAddress: stakedStrkPosition.token.address,
    })
  }
  return (
    <UnstakingScreen
      onBack={onBack}
      stakerInfo={stakedStrkPosition.position.stakerInfo}
      balance={stakedStrkPosition.balance}
      usdValue={stakedStrkPosition.usdValue}
      tokenInfo={stakedStrkPosition.token}
      liquidityToken={stakedStrkPosition.token}
      withdrawLoading={withdrawLoading}
      onWithdraw={onWithdraw}
    />
  )
}
