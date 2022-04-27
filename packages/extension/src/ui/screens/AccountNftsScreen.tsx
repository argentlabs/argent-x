import { FC } from "react"

import { AccountContainer } from "../components/Account/AccountContainer"
import { AccountNfts } from "../components/Account/AccountNfts"
import { useSelectedAccount } from "../states/account"

export const AccountNftsScreen: FC = () => {
  const account = useSelectedAccount()

  if (!account) {
    return <AccountContainer />
  }

  return (
    <AccountContainer>
      <AccountNfts account={account} />
    </AccountContainer>
  )
}
