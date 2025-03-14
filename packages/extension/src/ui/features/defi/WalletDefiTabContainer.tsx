import {
  InvestSecondaryIcon,
  ChevronRightSecondaryIcon,
} from "@argent/x-ui/icons"
import { CellStack } from "@argent/x-ui"
import { Suspense, type FC } from "react"

import { Link } from "react-router-dom"
import { isDefiDecompositionEnabled } from "../../../shared/defiDecomposition"
import { stakingStore } from "../../../shared/staking/storage"
import { routes } from "../../../shared/ui/routes"
import { Option } from "../../components/Option"
import { useCurrentPathnameWithQuery } from "../../hooks/useRoute"
import { useKeyValueStorage } from "../../hooks/useStorage"
import {
  DefiDecompositionContainer,
  DefiDecompositionSkeleton,
  StakedStrkOnlyDecompositionContainer,
} from "./defiDecomposition/DefiDecompositionContainer"

export const WalletDefiTabContainer: FC = () => {
  return (
    <Suspense fallback={<DefiDecompositionSkeleton px={4} />}>
      <WalletDefiContainer />
    </Suspense>
  )
}

export const WalletDefiContainer: FC = () => {
  const returnTo = useCurrentPathnameWithQuery()

  const isStakingEnabled = useKeyValueStorage(stakingStore, "enabled")

  const nativeApyPercentage = useKeyValueStorage(
    stakingStore,
    "nativeApyPercentage",
  )

  // Rare case where we only have staked STRK and no other DeFi products
  const strkOnlyDefiDecomp = isStakingEnabled && !isDefiDecompositionEnabled

  return (
    <CellStack pt={0} gap={4}>
      {isStakingEnabled && (
        <Option
          as={Link}
          to={routes.staking(returnTo)}
          title={"Stake STRK and start earning"}
          description={`Earn ${nativeApyPercentage}% APY`}
          icon={<InvestSecondaryIcon />}
          rightIcon={<ChevronRightSecondaryIcon />}
        />
      )}
      {isDefiDecompositionEnabled && <DefiDecompositionContainer />}
      {strkOnlyDefiDecomp && <StakedStrkOnlyDecompositionContainer />}
    </CellStack>
  )
}
