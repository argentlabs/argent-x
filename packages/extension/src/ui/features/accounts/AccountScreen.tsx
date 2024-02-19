import { FC, ReactNode } from "react"

import { AccountActivityContainer } from "../accountActivity/AccountActivityContainer"
import { AccountCollectionsContainer } from "../accountNfts/AccountCollectionsContainer"
import { AccountTokensContainer } from "../accountTokens/AccountTokensContainer"
import { StatusMessageFullScreenContainer } from "../statusMessage/StatusMessageFullScreen"
import { useShouldShowFullScreenStatusMessage } from "../statusMessage/useShouldShowFullScreenStatusMessage"
import { NoSwap } from "../swap/NoSwap"
import { Swap } from "../swap/Swap"
import { AccountContainer } from "./AccountContainer"
import { useAccount } from "./accounts.state"
import { AccountScreenEmptyContainer } from "./AccountScreenEmptyContainer"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { useIsDefaultNetwork } from "../networks/hooks/useIsDefaultNetwork"
import { AccountDiscoverScreenContainer } from "../discover/AccountDiscoverScreenContainer"

interface AccountScreenProps {
  tab: "tokens" | "collections" | "activity" | "swap" | "discover"
}

/** TODO: refactor: rename 'RootContainer' or similar */

export const AccountScreen: FC<AccountScreenProps> = ({ tab }) => {
  const walletAccount = useView(selectedAccountView)
  const account = useAccount(walletAccount)
  const shouldShowFullScreenStatusMessage =
    useShouldShowFullScreenStatusMessage()

  const isDefaultNetwork = useIsDefaultNetwork()

  const hasAccount = account !== undefined

  if (shouldShowFullScreenStatusMessage) {
    return <StatusMessageFullScreenContainer />
  }

  let body: ReactNode
  if (!hasAccount) {
    body = <AccountScreenEmptyContainer />
  } else if (tab === "tokens") {
    body = <AccountTokensContainer account={account} />
  } else if (tab === "collections") {
    body = <AccountCollectionsContainer account={account} />
  } else if (tab === "activity") {
    body = <AccountActivityContainer account={account} />
  } else if (tab === "discover") {
    body = <AccountDiscoverScreenContainer account={account} />
  } else if (tab === "swap") {
    body = isDefaultNetwork ? <Swap /> : <NoSwap /> // Swap is only available on default network
  } else {
    tab satisfies never
  }

  const scrollKey = `accounts/account-${tab}`
  return <AccountContainer scrollKey={scrollKey}>{body}</AccountContainer>
}
