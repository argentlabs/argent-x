import { BarBackButton, CellStack, NavigationContainer } from "@argent/x-ui"
import { type FC } from "react"

import { useNavigate } from "react-router-dom"
import { routes } from "../../../../shared/ui/routes"
import { useReturnTo } from "../../../hooks/useRoute"
import { StakingButtonCell } from "./StakingButtonCell"
import { useNavigateReturnToOr } from "../../../hooks/useNavigateReturnTo"
import { useKeyValueStorage } from "../../../hooks/useStorage"
import { stakingStore } from "../../../../shared/staking/storage"

export const StakingScreenContainer: FC = () => {
  const navigate = useNavigate()

  /** TODO: determine state - 'start staking' or 'staking dashboard' */

  const onBack = useNavigateReturnToOr(routes.accountTokens.path)
  const returnTo = useReturnTo()

  const apyPercentage = useKeyValueStorage(stakingStore, "apyPercentage")

  return (
    <NavigationContainer
      leftButton={<BarBackButton onClick={onBack} />}
      title="Start staking"
    >
      <CellStack pt={0}>
        <StakingButtonCell
          color="#0C0C4C"
          title="Native Staking"
          badgeText={`Up to ${apyPercentage}%`}
          subtitle="Stake your assets to secure the network and earn rewards"
          imageSrc="./assets/staking/native-staking.png"
          onClick={() => navigate(routes.nativeStakingIndex(returnTo))}
        />
        <StakingButtonCell
          color="#2B3850"
          title="Liquid Staking"
          subtitle="Stake your assets to secure the network and earn rewards"
          imageSrc="./assets/staking/liquid-staking.png"
          onClick={() => navigate(routes.liquidStakingSelect(returnTo))}
        />
      </CellStack>
    </NavigationContainer>
  )
}
