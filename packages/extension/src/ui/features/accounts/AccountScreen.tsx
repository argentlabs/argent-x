import { FC, ReactNode } from "react"

import { assertNever } from "../../utils/assertNever"
import { AccountActivity } from "../accountActivity/AccountActivity"
import { AccountNfts } from "../accountNfts/AccountNfts"
import { AccountTokens } from "../accountTokens/AccountTokens"
import { AccountContainer } from "./AccountContainer"
import { useSelectedAccount } from "./accounts.service"

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
