import type { FC } from "react"
import { Suspense, useState } from "react"

import { useReturnTo } from "../../hooks/useRoute"
import { routes } from "../../../shared/ui/routes"
import { useView } from "../../views/implementation/react"
import { selectedNetworkIdView } from "../../views/network"
import { NetworkSwitcherContainer } from "../navigation/NetworkSwitcherContainer"
import { useNavigateReturnToOr } from "../../hooks/useNavigateReturnTo"
import type { NavigationBarProps } from "@argent/x-ui"
import { BarCloseButton, NavigationBar } from "@argent/x-ui"
import { AccountListContainer } from "./AccountListContainer"
import { AccountListSkeleton } from "./AccountList"

export const AccountListScreenContainerSkeleton: FC = () => {
  return (
    <>
      <NavigationBar />
      <AccountListSkeleton />
    </>
  )
}

export const AccountListScreenContainer: FC<NavigationBarProps> = (props) => {
  const returnTo = useReturnTo()
  const onBack = useNavigateReturnToOr(routes.accountTokens())

  /** Switching network is transient here - only change account when user explicitly selects one */
  const defaultNetworkId = useView(selectedNetworkIdView)
  const [networkId, setNetworkId] = useState(defaultNetworkId)

  const title = (
    <NetworkSwitcherContainer
      networkId={networkId}
      onChangeNetworkId={setNetworkId}
    />
  )

  return (
    <>
      <NavigationBar
        title={title}
        rightButton={<BarCloseButton onClick={onBack} />}
        {...props}
      />
      <Suspense fallback={<AccountListSkeleton />}>
        <AccountListContainer networkId={networkId} returnTo={returnTo} />
      </Suspense>
    </>
  )
}
