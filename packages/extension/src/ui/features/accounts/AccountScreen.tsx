import { FC, ReactNode } from "react"

import { assertNever } from "../../services/assertNever"
import { AccountActivityContainer } from "../accountActivity/AccountActivityContainer"
import { AccountCollections } from "../accountNfts/AccountCollections"
import { AccountTokens } from "../accountTokens/AccountTokens"
import { StatusMessageFullScreenContainer } from "../statusMessage/StatusMessageFullScreen"
import { useShouldShowFullScreenStatusMessage } from "../statusMessage/useShouldShowFullScreenStatusMessage"
import { AccountContainer } from "./AccountContainer"
import { useSelectedAccount } from "./accounts.state"
import { AccountScreenEmpty } from "./AccountScreenEmpty"
import { useAddAccount } from "./useAddAccount"

interface AccountScreenProps {
  tab: "tokens" | "collections" | "activity"
}

export const AccountScreen: FC<AccountScreenProps> = ({ tab }) => {
  const account = useSelectedAccount()
  const shouldShowFullScreenStatusMessage =
    useShouldShowFullScreenStatusMessage()
  const { addAccount, isDeploying } = useAddAccount()

  const hasAcccount = !!account
  const showEmpty = !hasAcccount || (hasAcccount && isDeploying)

  let body: ReactNode
  let scrollKey = "accounts/AccountScreen"
  if (showEmpty) {
    return (
      <AccountScreenEmpty onAddAccount={addAccount} isDeploying={isDeploying} />
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
  } else {
    assertNever(tab)
  }

  return <AccountContainer scrollKey={scrollKey}>{body}</AccountContainer>
}
