import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted"
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

const Container = styled(AccountColumn)`
  margin-top: 68px;
`

const AccountHeader = styled.div`
  position: fixed;
  top: 0;
  width: 100%;
  background: #161616;
  height: 68px;
  z-index: 100;
`

const AccountFooter = styled.div`
  position: fixed;
  display: flex;
  bottom: 0;
  width: 100%;
  background: #161616;
  height: 64px;
`

const FooterTab = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 50%;

  svg {
    font-size: 1.8rem;
  }

  span {
    margin-top: 3px;
  }

  transition: all 200ms ease-in-out;

  &:hover,
  &:focus {
    outline: 0;
    background: rgba(255, 255, 255, 0.05);
  }
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
    <Container>
      <AccountHeader>
        <Header>
          <ProfilePicture
            {...makeClickable(() => navigate(routes.accounts()))}
            src={getAccountImageUrl(accountName, account.address)}
          />
          <NetworkSwitcher />
        </Header>
      </AccountHeader>

      {tab === "assets" ? (
        <AccountAssets account={account} />
      ) : (
        <AccountActivity account={account} />
      )}

      <AccountFooter>
        <FooterTab onClick={() => setTab("assets")}>
          <AccountBalanceWalletIcon />
          <span>Assets</span>
        </FooterTab>
        <FooterTab onClick={() => setTab("activity")}>
          <FormatListBulletedIcon />
          <span>Activity</span>
        </FooterTab>
      </AccountFooter>
    </Container>
  )
}
