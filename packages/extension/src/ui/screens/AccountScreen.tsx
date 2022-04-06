import { FC, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { Account } from "../Account"
import { AccountActivity } from "../components/Account/AccountActivity"
import { AccountAssets } from "../components/Account/AccountAssets"
import { AccountColumn } from "../components/Account/AccountColumn"
import { ProfilePicture } from "../components/Account/ProfilePicture"
import { Header } from "../components/Header"
import { NetworkSwitcher } from "../components/NetworkSwitcher"
import { routes } from "../routes"
import { selectAccount, useAccount } from "../states/account"
import { getAccountName, useAccountMetadata } from "../states/accountMetadata"
import { makeClickable } from "../utils/a11y"
import { getAccountImageUrl } from "../utils/accounts"

type AccountTab = "assets" | "activity"

const AccountFooter = styled.div`
  position: fixed;
  bottom: 0;
  width: 100%;
  background: pink;
  height: 50px;
`

export const AccountScreen: FC = () => {
  const navigate = useNavigate()
  const account = useAccount(selectAccount)

  useEffect(() => {
    if (!account) {
      navigate(routes.accounts())
    }
  }, [])

  if (!account) {
    return <></>
  }

  return <AccountScreenContent account={account} />
}

interface AccountScreenContentProps {
  account: Account
}

const AccountScreenContent: FC<AccountScreenContentProps> = ({ account }) => {
  const navigate = useNavigate()
  const { accountNames } = useAccountMetadata()
  const [tab, setTab] = useState<AccountTab>("assets")

  const accountName = getAccountName(account, accountNames)

  return (
    <AccountColumn>
      <Header>
        <ProfilePicture
          {...makeClickable(() => navigate(routes.accounts()))}
          src={getAccountImageUrl(accountName, account.address)}
        />
        <NetworkSwitcher />
      </Header>
      {tab === "assets" ? (
        <AccountAssets account={account} />
      ) : (
        <AccountActivity account={account} />
      )}

      <AccountFooter>
        <button onClick={() => setTab("assets")}>Assets</button>
        <button onClick={() => setTab("activity")}>Activity</button>
      </AccountFooter>
    </AccountColumn>
  )
}
