import { partition, some } from "lodash-es"
import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { isDeprecated } from "../../../shared/wallet.service"
import { useAppState } from "../../app.state"
import { Header } from "../../components/Header"
import { IconButton } from "../../components/IconButton"
import { AddIcon, SettingsIcon } from "../../components/Icons/MuiIcons"
import { routes } from "../../routes"
import { makeClickable } from "../../services/a11y"
import { connectAccount } from "../../services/backgroundAccounts"
import { H1, P } from "../../theme/Typography"
import { NetworkSwitcher } from "../networks/NetworkSwitcher"
import { useBackupRequired } from "../recovery/backupDownload.state"
import { recover } from "../recovery/recovery.service"
import { RecoveryBanner } from "../recovery/RecoveryBanner"
import { Container } from "./AccountContainer"
import { AccountHeader } from "./AccountHeader"
import { AccountListItem } from "./AccountListItem"
import { deployAccount } from "./accounts.service"
import { useAccounts } from "./accounts.state"
import { DeprecatedAccountsWarning } from "./DeprecatedAccountsWarning"

const AccountList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 48px 32px;
`

const AccountListWrapper = styled(Container)`
  display: flex;
  flex-direction: column;

  ${H1} {
    text-align: center;
  }

  > ${AccountList} {
    width: 100%;
  }
`

const IconButtonCenter = styled(IconButton)`
  margin: auto;
`

const Paragraph = styled(P)`
  text-align: center;
`

export const AccountListScreen: FC = () => {
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()
  const { accounts, selectedAccount, addAccount } = useAccounts()
  const { isBackupRequired } = useBackupRequired()

  const accountsList = Object.values(accounts)

  const [deprecatedAccounts, newAccounts] = partition(accountsList, (account) =>
    isDeprecated(account),
  )

  const handleAddAccount = async () => {
    useAppState.setState({ isLoading: true })
    try {
      const newAccount = await deployAccount(switcherNetworkId)
      addAccount(newAccount)
      connectAccount(newAccount)
      navigate(await recover())
    } catch (error: any) {
      useAppState.setState({ error: `${error}` })
      navigate(routes.error())
    } finally {
      useAppState.setState({ isLoading: false })
    }
  }

  return (
    <AccountListWrapper header>
      <AccountHeader>
        <Header>
          <IconButton
            size={36}
            {...makeClickable(() => navigate(routes.settings()), {
              label: "Settings",
              tabIndex: 99,
            })}
          >
            <SettingsIcon />
          </IconButton>
          <NetworkSwitcher />
        </Header>
      </AccountHeader>
      <H1>Accounts</H1>
      <AccountList>
        {isBackupRequired && <RecoveryBanner noMargins />}
        {accountsList.length === 0 && (
          <Paragraph>
            No accounts on this network, click below to add one.
          </Paragraph>
        )}
        {newAccounts.map((account) => (
          <AccountListItem
            key={account.address}
            account={account}
            selectedAccount={selectedAccount}
            canShowUpgrade
          />
        ))}
        {some(deprecatedAccounts) && (
          <>
            <DeprecatedAccountsWarning />
            {deprecatedAccounts.map((account) => (
              <AccountListItem
                key={account.address}
                account={account}
                selectedAccount={selectedAccount}
                canShowUpgrade
              />
            ))}
          </>
        )}
        <IconButtonCenter
          size={48}
          {...makeClickable(handleAddAccount, { label: "Create new wallet" })}
        >
          <AddIcon fontSize="large" />
        </IconButtonCenter>
      </AccountList>
    </AccountListWrapper>
  )
}
