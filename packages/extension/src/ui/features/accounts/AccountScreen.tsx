import { FC, ReactNode } from "react"

import { assertNever } from "../../services/assertNever"
import { AccountActivity } from "../accountActivity/AccountActivity"
import { AccountNfts } from "../accountNfts/AccountNfts"
import { AccountTokens } from "../accountTokens/AccountTokens"
import { StatusMessageFullScreenContainer } from "../statusMessage/StatusMessageFullScreen"
import { useShouldShowFullScreenStatusMessage } from "../statusMessage/useShouldShowFullScreenStatusMessage"
import { AccountContainer } from "./AccountContainer"
import { useAccounts, useSelectedAccount } from "./accounts.state"
import { DeprecatedAccountScreen } from "./DeprecatedAccountScreen"

interface AccountScreenProps {
  tab: "tokens" | "nfts" | "activity"
}

export const AccountScreen: FC<AccountScreenProps> = ({ tab }) => {
  const account = useSelectedAccount()
  const { showMigrationScreen } = useAccounts()
  const shouldShowFullScreenStatusMessage =
    useShouldShowFullScreenStatusMessage()

  let body: ReactNode
  if (!account) {
    body = <></>
  } else if (showMigrationScreen) {
    return (
      <DeprecatedAccountScreen
        onSubmit={() => useAccounts.setState({ showMigrationScreen: false })}
      />
    )
  } else if (shouldShowFullScreenStatusMessage) {
    return <StatusMessageFullScreenContainer />
  } else if (tab === "tokens") {
    body = <AccountTokens account={account} />
  } else if (tab === "nfts") {
    body = <AccountNfts account={account} />
  } else if (tab === "activity") {
    body = <AccountActivity account={account} />
  } else {
    assertNever(tab)
  }

  return <AccountContainer>{body}</AccountContainer>
}
