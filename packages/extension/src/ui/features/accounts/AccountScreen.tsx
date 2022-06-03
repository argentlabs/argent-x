import { FC, ReactNode, useState } from "react"

import { hasLatestDerivationPath } from "../../../shared/wallet.service"
import { assertNever } from "../../services/assertNever"
import { AccountActivity } from "../accountActivity/AccountActivity"
import { AccountNfts } from "../accountNfts/AccountNfts"
import { AccountTokens } from "../accountTokens/AccountTokens"
import { AccountContainer } from "./AccountContainer"
import { useSelectedAccount } from "./accounts.state"
import { DeprecatedAccountScreen } from "./DeprecatedAccountScreen"

interface AccountScreenProps {
  tab: "tokens" | "nfts" | "activity"
}

export const AccountScreen: FC<AccountScreenProps> = ({ tab }) => {
  const account = useSelectedAccount()
  const [showDeprecated, setShowDeprecated] = useState(
    account ? !hasLatestDerivationPath(account) : false,
  )

  let body: ReactNode
  if (!account) {
    body = <></>
  } else if (showDeprecated) {
    return <DeprecatedAccountScreen onSubmit={() => setShowDeprecated(false)} />
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
