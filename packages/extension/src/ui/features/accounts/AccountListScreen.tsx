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
import { AccountListScreenItem } from "./AccountListScreenItem"
import { deployAccount } from "./accounts.service"
import {
  useAccounts,
  useHiddenAccounts,
  useVisibleAccounts,
} from "./accounts.state"
import { DeprecatedAccountsWarning } from "./DeprecatedAccountsWarning"

interface IAccountList {
  hasHiddenAccounts: boolean
}

const AccountList = styled.div<IAccountList>`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 48px 32px
    ${({ hasHiddenAccounts }) => (hasHiddenAccounts ? "64px" : "48px")} 32px;
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

export const Footer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.bg1};
  background: linear-gradient(
    180deg,
    rgba(16, 16, 16, 0.4) 0%,
    ${({ theme }) => theme.bg1} 73.72%
  );
  box-shadow: 0px 2px 12px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(10px);
  z-index: 100;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ theme }) => theme.mediaMinWidth.sm`
    left: ${theme.margin.extensionInTab};
    right: ${theme.margin.extensionInTab};
  `}
`

export const AccountListScreen: FC = () => {
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()
  const { selectedAccount, addAccount } = useAccounts()
  const visibleAccounts = useVisibleAccounts()
  const hiddenAccounts = useHiddenAccounts()
  const { isBackupRequired } = useBackupRequired()

  const visibleAccountsList = Object.values(visibleAccounts)
  const hasHiddenAccounts = Object.values(hiddenAccounts).length > 0

  const [deprecatedAccounts, newAccounts] = partition(
    visibleAccountsList,
    (account) => isDeprecated(account),
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
      <AccountList hasHiddenAccounts={hasHiddenAccounts}>
        {isBackupRequired && <RecoveryBanner noMargins />}
        {visibleAccountsList.length === 0 && (
          <Paragraph>
            No {hasHiddenAccounts ? "visible" : ""} accounts on this network,
            click below to add one.
          </Paragraph>
        )}
        {newAccounts.map((account) => (
          <AccountListScreenItem
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
              <AccountListScreenItem
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
      {hasHiddenAccounts && (
        <Footer>
          <button onClick={() => navigate(routes.accountsHidden())}>
            Hidden accounts
          </button>
        </Footer>
      )}
    </AccountListWrapper>
  )
}
