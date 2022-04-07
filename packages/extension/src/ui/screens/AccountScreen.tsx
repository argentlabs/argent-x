import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted"
import { FC, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { Account } from "../Account"
import { AccountActivity } from "../components/Account/AccountActivity"
import { AccountAssets } from "../components/Account/AccountAssets"
import { Container } from "../components/Account/AccountContainer"
import { AccountFooter, FooterTab } from "../components/Account/AccountFooter"
import { AccountHeader } from "../components/Account/AccountHeader"
import { ProfilePicture } from "../components/Account/ProfilePicture"
import { Header } from "../components/Header"
import { NetworkSwitcher } from "../components/NetworkSwitcher"
import { RecoveryBanner } from "../components/RecoveryBanner"
import { routes } from "../routes"
import { selectAccount, useAccount } from "../states/account"
import { getAccountName, useAccountMetadata } from "../states/accountMetadata"
import { useBackupRequired } from "../states/backupDownload"
import { makeClickable } from "../utils/a11y"
import { getAccountImageUrl } from "../utils/accounts"

type AccountTab = "assets" | "activity"

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
  const { isBackupRequired } = useBackupRequired()

  const accountName = getAccountName(account, accountNames)

  return (
    <Container header footer>
      <AccountHeader>
        <Header>
          <ProfilePicture
            {...makeClickable(() => navigate(routes.accounts()))}
            src={getAccountImageUrl(accountName, account.address)}
          />
          <NetworkSwitcher />
        </Header>
      </AccountHeader>

      {isBackupRequired && <RecoveryBanner />}

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
