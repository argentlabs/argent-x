import { FC, ReactNode } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../routes"
import { assertNever } from "../../services/assertNever"
import { AccountActivityContainer } from "../accountActivity/AccountActivity"
import { AccountCollections } from "../accountNfts/AccountCollections"
import { AccountTokens } from "../accountTokens/AccountTokens"
import { StatusMessageFullScreenContainer } from "../statusMessage/StatusMessageFullScreen"
import { useShouldShowFullScreenStatusMessage } from "../statusMessage/useShouldShowFullScreenStatusMessage"
import { AccountContainer } from "./AccountContainer"
import { useSelectedAccount, useSelectedAccountStore } from "./accounts.state"
import { DeprecatedAccountScreen } from "./DeprecatedAccountScreen"

interface AccountScreenProps {
  tab: "tokens" | "collections" | "activity"
}

export const AccountScreen: FC<AccountScreenProps> = ({ tab }) => {
  const account = useSelectedAccount()
  const showMigrationScreen = useSelectedAccountStore(
    (x) => x.showMigrationScreen,
  )
  const shouldShowFullScreenStatusMessage =
    useShouldShowFullScreenStatusMessage()
  const navigate = useNavigate()

  let body: ReactNode
  if (!account) {
    navigate(routes.accounts())
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
    body = <AccountTokens account={account} />
  } else if (tab === "collections") {
    body = <AccountCollections account={account} />
  } else if (tab === "activity") {
    body = <AccountActivityContainer account={account} />
  } else {
    assertNever(tab)
  }

  return <AccountContainer>{body}</AccountContainer>
}
