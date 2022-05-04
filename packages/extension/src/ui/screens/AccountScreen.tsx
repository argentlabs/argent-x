import { FC, ReactNode } from "react"

import { AccountActivity } from "../components/Account/AccountActivity"
import { AccountContainer } from "../components/Account/AccountContainer"
import { AccountTokens } from "../components/Account/AccountTokens"
import { AccountNfts } from "../features/accountNfts/AccountNfts"
import { useSelectedAccount } from "../states/account"
import { assertNever } from "../utils/assertNever"

interface AccountScreenProps {
  tab: "tokens" | "nfts" | "activity"
}

export const AccountScreen: FC<AccountScreenProps> = ({ tab }) => {
  const account = useSelectedAccount()

  let body: ReactNode
  if (!account) {
    body = <></>
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
