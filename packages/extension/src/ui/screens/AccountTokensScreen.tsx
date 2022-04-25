import { FC } from "react"

import { AccountAssets } from "../components/Account/AccountAssets"
import { AccountContainer } from "../components/Account/AccountContainer"
import { useSelectedAccount } from "../states/account"

export const AccountTokensScreen: FC = () => {
  const account = useSelectedAccount()

  if (!account) {
    return <AccountContainer />
  }

  return (
    <AccountContainer>
      <AccountAssets account={account} />
    </AccountContainer>
  )
}
