import type { Address } from "@argent/x-shared"
import type { FC } from "react"
import { useAction } from "../../../hooks/useAction"
import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"
import { useRouteInvestmentPositionId } from "../../../hooks/useRoute"
import { stakingService } from "../../../services/staking"
import { selectedAccountView } from "../../../views/account"
import { useView } from "../../../views/implementation/react"
import { liquidStakingPositionUsdValueAtom } from "../../../views/staking"
import { useInvestmentProviderInfo } from "./hooks/useInvestmentProviderInfo"
import { useSelectedLiquidStakingInvestment } from "./hooks/useStrkLiquidStakingInvestments"
import { UnstakingScreen } from "./UnstakingScreen"

export const LiquidUnstakingScreenContainer: FC = () => {
  const selectedAccount = useView(selectedAccountView)
  const onBack = useNavigateReturnToOrBack()

  const { action: unstake } = useAction(
    stakingService.unstake.bind(stakingService),
  )

  const positionId = useRouteInvestmentPositionId()

  const stakedStrkPosition = useView(
    liquidStakingPositionUsdValueAtom({
      account: selectedAccount,
      positionId,
    }),
  )

  const [investment] = useSelectedLiquidStakingInvestment(
    stakedStrkPosition?.position.investmentId,
  )
  const providerInfo = useInvestmentProviderInfo(investment)

  if (
    !selectedAccount ||
    !stakedStrkPosition ||
    !stakedStrkPosition.position.investmentId
  ) {
    return null
  }

  const onWithdraw = () => {
    if (
      !stakedStrkPosition.position.investmentId ||
      !stakedStrkPosition.position.liquidityToken?.address
    ) {
      return
    }

    void unstake({
      investmentId: stakedStrkPosition.position.investmentId,
      amount: stakedStrkPosition.balance.stakedAmount,
      stakerInfo: { ...providerInfo },
      accountAddress: selectedAccount.address as Address,
      accountType: selectedAccount.type,
      tokenAddress: stakedStrkPosition.position.liquidityToken?.address,
    })
  }

  if (!providerInfo) {
    return null
  }

  return (
    <UnstakingScreen
      onBack={onBack}
      stakerInfo={{ ...providerInfo }}
      balance={stakedStrkPosition.balance}
      usdValue={stakedStrkPosition.usdValue}
      tokenInfo={stakedStrkPosition.token}
      liquidityToken={stakedStrkPosition.liquidityToken}
      onWithdraw={onWithdraw}
      stakingType={investment?.category}
    />
  )
}
