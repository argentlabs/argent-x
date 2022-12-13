import { SwapProvider } from "@argent/x-swap"
import { FC, ReactNode } from "react"

import { getMulticallForNetwork } from "../../../shared/multicall"
import { assertNever } from "../../services/assertNever"
import { AccountActivityContainer } from "../accountActivity/AccountActivityContainer"
import { AccountCollections } from "../accountNfts/AccountCollections"
import { AccountTokens } from "../accountTokens/AccountTokens"
import { StatusMessageFullScreenContainer } from "../statusMessage/StatusMessageFullScreen"
import { useShouldShowFullScreenStatusMessage } from "../statusMessage/useShouldShowFullScreenStatusMessage"
import { Swap } from "../swap/Swap"
import { AccountContainer } from "./AccountContainer"
import { useSelectedAccount, useSelectedAccountStore } from "./accounts.state"
import { AccountScreenEmpty } from "./AccountScreenEmpty"
import { DeprecatedAccountScreen } from "./DeprecatedAccountScreen"
import { useAddAccount } from "./useAddAccount"

interface AccountScreenProps {
  tab: "tokens" | "collections" | "activity" | "swap"
}

export const AccountScreen: FC<AccountScreenProps> = ({ tab }) => {
  const account = useSelectedAccount()
  const showMigrationScreen = useSelectedAccountStore(
    (x) => x.showMigrationScreen,
  )
  const shouldShowFullScreenStatusMessage =
    useShouldShowFullScreenStatusMessage()
  const { addAccount, isDeploying } = useAddAccount()

  const hasAcccount = !!account
  const showEmpty = !hasAcccount || (hasAcccount && isDeploying)

  const multicall = account && getMulticallForNetwork(account?.network)

  let body: ReactNode
  let scrollKey = "accounts/AccountScreen"
  if (showEmpty) {
    return (
      <AccountScreenEmpty onAddAccount={addAccount} isDeploying={isDeploying} />
    )
  } else if (showMigrationScreen) {
    return (
      <DeprecatedAccountScreen
        onSubmit={() =>
          useSelectedAccountStore.setState({ showMigrationScreen: false })
        }
      />
    )
  } else if (shouldShowFullScreenStatusMessage) {
    return <StatusMessageFullScreenContainer />
  } else if (tab === "tokens") {
    scrollKey = "accounts/AccountTokens"
    body = <AccountTokens account={account} />
  } else if (tab === "collections") {
    scrollKey = "accounts/AccountCollections"
    body = <AccountCollections account={account} />
  } else if (tab === "activity") {
    scrollKey = "accounts/AccountActivityContainer"
    body = <AccountActivityContainer account={account} />
  } else if (tab === "swap") {
    body = (
      <SwapProvider selectedAccount={account} multicall={multicall}>
        <Swap />
      </SwapProvider>
    )
  } else {
    assertNever(tab)
  }

  return <AccountContainer scrollKey={scrollKey}>{body}</AccountContainer>
}
