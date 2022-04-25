import { FC } from "react"

import { AccountActivity } from "../components/Account/AccountActivity"
import { AccountContainer } from "../components/Account/AccountContainer"
import { useSelectedAccount } from "../states/account"

export const AccountActivityScreen: FC = () => {
  const account = useSelectedAccount()

  if (!account) {
    return <AccountContainer />
  }

  return (
    <AccountContainer>
      <AccountActivity account={account} />
    </AccountContainer>
  )
}
