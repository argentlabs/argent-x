import { FC, ReactNode, Suspense } from "react"

import { AccountActivityContainer } from "../accountActivity/AccountActivityContainer"
import { AccountCollectionsContainer } from "../accountNfts/AccountCollectionsContainer"
import { AccountTokensContainer } from "../accountTokens/AccountTokensContainer"
import { SwapScreenContainer } from "../swap/SwapScreenContainer"
import { AccountScreenEmptyContainer } from "../accounts/AccountScreenEmptyContainer"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { AccountDiscoverScreenContainer } from "../discover/AccountDiscoverScreenContainer"
import { AccountActivityContainerV2 } from "../accountActivityV2/AccountActivityContainerV2"
import { isActivityV2FeatureEnabled } from "../../../shared/activity"
import { UseAccountEscapeWarning } from "../smartAccount/escape/UseAccountEscapeWarning"
import { RootTabsScreeen } from "./RootTabsScreen"
import { useShouldShowFullScreenStatusMessage } from "../statusMessage/useShouldShowFullScreenStatusMessage"
import { StatusMessageFullScreenContainer } from "../statusMessage/StatusMessageFullScreen"

interface RootTabsScreenContainerProps {
  tab: "tokens" | "collections" | "activity" | "swap" | "discover"
}

/** TODO: refactor: rename 'RootContainer' or similar */

export const RootTabsScreenContainer: FC<RootTabsScreenContainerProps> = ({
  tab,
}) => {
  const account = useView(selectedAccountView)

  const hasAccount = account !== undefined

  let body: ReactNode
  if (!hasAccount) {
    body = <AccountScreenEmptyContainer />
  } else if (tab === "tokens") {
    body = <AccountTokensContainer account={account} />
  } else if (tab === "collections") {
    body = <AccountCollectionsContainer account={account} />
  } else if (tab === "activity") {
    if (isActivityV2FeatureEnabled) {
      body = <AccountActivityContainerV2 account={account} />
    } else {
      body = <AccountActivityContainer account={account} />
    }
  } else if (tab === "discover") {
    body = <AccountDiscoverScreenContainer />
  } else if (tab === "swap") {
    body = <SwapScreenContainer />
  } else {
    tab satisfies never
  }

  const scrollKey = `accounts/account-${tab}`

  const shouldShowFullScreenStatusMessage =
    useShouldShowFullScreenStatusMessage()

  if (shouldShowFullScreenStatusMessage) {
    return <StatusMessageFullScreenContainer />
  }

  return (
    <>
      <Suspense>
        <UseAccountEscapeWarning />
      </Suspense>
      <RootTabsScreeen scrollKey={scrollKey}>{body}</RootTabsScreeen>
    </>
  )
}
