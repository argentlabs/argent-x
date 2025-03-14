import type { FC } from "react"
import { Suspense, useMemo, useState } from "react"

import { AccountCollectionsContainer } from "../accountNfts/AccountCollectionsContainer"
import { AccountTokensContainer } from "../accountTokens/AccountTokensContainer"
import { SwapScreenContainer } from "../swap/SwapScreenContainer"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { AccountDiscoverScreenContainer } from "../discover/AccountDiscoverScreenContainer"
import { AccountActivityContainer } from "../accountActivity/AccountActivityContainer"
import { UseAccountEscapeWarning } from "../smartAccount/escape/UseAccountEscapeWarning"
import { RootTabsScreen } from "./RootTabsScreen"
import { useShouldShowFullScreenStatusMessage } from "../statusMessage/useShouldShowFullScreenStatusMessage"
import { StatusMessageFullScreenContainer } from "../statusMessage/StatusMessageFullScreenContainer"
import { RootTabsEmptyScreenContainer } from "./RootTabsEmptyScreenContainer"
import { AccountListScreenContainerPreload } from "../accounts/AccountListScreenContainerPreload"

interface RootTabsScreenContainerProps {
  tab: "tokens" | "collections" | "activity" | "swap" | "discover"
}

/** TODO: refactor: rename 'RootContainer' or similar */

export const RootTabsScreenContainer: FC<RootTabsScreenContainerProps> = ({
  tab,
}) => {
  const account = useView(selectedAccountView)
  const hasAccount = account !== undefined

  const [hideAccountNavigationBar, setHideAccountNavigationBar] =
    useState(false)

  const body = useMemo(() => {
    if (!hasAccount) {
      return <RootTabsEmptyScreenContainer />
    } else if (tab === "tokens") {
      return <AccountTokensContainer account={account} />
    } else if (tab === "collections") {
      return <AccountCollectionsContainer account={account} />
    } else if (tab === "activity") {
      return <AccountActivityContainer account={account} />
    } else if (tab === "discover") {
      return <AccountDiscoverScreenContainer />
    } else if (tab === "swap") {
      setHideAccountNavigationBar(true)
      return <SwapScreenContainer />
    } else {
      tab satisfies never
    }
  }, [account, tab, hasAccount])

  const scrollKey = `accounts/account-${tab}`

  const shouldShowFullScreenStatusMessage =
    useShouldShowFullScreenStatusMessage()

  if (shouldShowFullScreenStatusMessage) {
    return <StatusMessageFullScreenContainer />
  }

  if (!hasAccount) {
    return body
  }

  return (
    <>
      <Suspense>
        <UseAccountEscapeWarning />
      </Suspense>
      <RootTabsScreen
        scrollKey={scrollKey}
        hideAccountNavigationBar={hideAccountNavigationBar}
      >
        {body}
      </RootTabsScreen>
      <AccountListScreenContainerPreload />
    </>
  )
}
