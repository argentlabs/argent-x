import { FC } from "react"

import { AccountContainer } from "../components/Account/AccountContainer"
import { AccountTokens } from "../components/Account/AccountTokens"
import { useSelectedAccount } from "../states/account"

export const AccountTokensScreen: FC = () => {
  const account = useSelectedAccount()

  if (!account) {
    return <AccountContainer />
  }

  return (
    <AccountContainer>
      <AccountTokens account={account} />
    </AccountContainer>
  )
}
