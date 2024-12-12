import { CellStack, icons } from "@argent/x-ui"
import { Suspense, type FC } from "react"

import { Link } from "react-router-dom"
import { isDefiDecompositionEnabled } from "../../../shared/defiDecomposition"
import { stakingStore } from "../../../shared/staking/storage"
import { routes } from "../../../shared/ui/routes"
import type { WalletAccount } from "../../../shared/wallet.model"
import { Option } from "../../components/Option"
import { useCurrentPathnameWithQuery } from "../../hooks/useRoute"
import { useKeyValueStorage } from "../../hooks/useStorage"
import { useView } from "../../views/implementation/react"
import { stakedStrkInvestmentForAccountView } from "../../views/staking"
import {
  DefiDecompositionContainer,
  DefiDecompositionSkeleton,
  StakedStrkOnlyDecompositionContainer,
} from "./defiDecomposition/DefiDecompositionContainer"

const { InvestSecondaryIcon, ChevronRightSecondaryIcon } = icons

export interface WalletDefiTabContainerProps {
  account: WalletAccount
}

export const WalletDefiTabContainer: FC<WalletDefiTabContainerProps> = ({
  account,
}) => {
  return (
    <Suspense fallback={<DefiDecompositionSkeleton px={4} />}>
      <WalletDefiContainer account={account} />
    </Suspense>
  )
}

export interface WalletDefiContainerProps {
  account: WalletAccount
}

export const WalletDefiContainer: FC<WalletDefiContainerProps> = ({
  account,
}) => {
  const returnTo = useCurrentPathnameWithQuery()

  const isStakingEnabled = useKeyValueStorage(stakingStore, "enabled")

  const stakedStrkInvestment = useView(
    stakedStrkInvestmentForAccountView(account),
  )

  const hasStakedStrkInvestment = stakedStrkInvestment.length > 0

  const apyPercentage = useKeyValueStorage(stakingStore, "apyPercentage")

  // Rare case where we only have staked STRK and no other DeFi products
  const strkOnlyDefiDecomp = isStakingEnabled && !isDefiDecompositionEnabled

  return (
    <CellStack pt={0} gap={4}>
      {isStakingEnabled && !hasStakedStrkInvestment && (
        <Option
          as={Link}
          to={routes.staking(returnTo)}
          title={"Stake STRK and start earning"}
          description={`Earn ${apyPercentage}% APY`}
          icon={<InvestSecondaryIcon />}
          rightIcon={<ChevronRightSecondaryIcon />}
        />
      )}
      {isDefiDecompositionEnabled && <DefiDecompositionContainer />}
      {strkOnlyDefiDecomp && <StakedStrkOnlyDecompositionContainer />}
    </CellStack>
  )
}
