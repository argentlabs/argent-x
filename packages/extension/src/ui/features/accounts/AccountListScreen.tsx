import { partition, some } from "lodash-es"
import { FC, useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { isDeprecated } from "../../../shared/wallet.service"
import { useAppState } from "../../app.state"
import { Header } from "../../components/Header"
import { IconButton } from "../../components/IconButton"
import { AddIcon, SettingsIcon } from "../../components/Icons/MuiIcons"
import { Spinner } from "../../components/Spinner"
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

const AccountList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 48px 32px;
`

const AccountListWrapper = styled(Container)`
  display: flex;
  flex-direction: column;
  position: relative;

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

const IconButtonCenterDisabled = styled(IconButtonCenter)`
  pointer-events: none;
`

const Paragraph = styled(P)`
  text-align: center;
`

const ErrorText = styled.div`
  text-align: center;
  font-size: 12px;
  color: ${({ theme }) => theme.red2};
`

const DimmingContainer = styled.div`
  background-color: ${({ theme }) => theme.bg1};
  opacity: 0.5;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
`

export const AccountListScreen: FC = () => {
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()
  const { selectedAccount, addAccount } = useAccounts()
  const visibleAccounts = useVisibleAccounts()
  const hiddenAccounts = useHiddenAccounts()
  const { isBackupRequired } = useBackupRequired()
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployFailed, setDeployFailed] = useState(false)

  console.log({ visibleAccounts, hiddenAccounts })

  const visibleAccountsList = Object.values(visibleAccounts)
  const hasHiddenAccounts = Object.values(hiddenAccounts).length > 0

  const [deprecatedAccounts, newAccounts] = partition(
    visibleAccountsList,
    (account) => isDeprecated(account),
  )

  const handleAddAccount = useCallback(async () => {
    setIsDeploying(true)
    setDeployFailed(false)
    try {
      const newAccount = await deployAccount(switcherNetworkId)
      addAccount(newAccount)
      connectAccount(newAccount)
      navigate(await recover())
    } catch (error: any) {
      setDeployFailed(true)
    } finally {
      setIsDeploying(false)
    }
  }, [addAccount, navigate, switcherNetworkId])

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
        {isDeploying ? (
          <>
            <DimmingContainer />
            <IconButtonCenterDisabled size={48}>
              <Spinner size={24} />
            </IconButtonCenterDisabled>
          </>
        ) : (
          <IconButtonCenter
            size={48}
            {...makeClickable(handleAddAccount, { label: "Create new wallet" })}
          >
            <AddIcon fontSize="large" />
          </IconButtonCenter>
        )}
        {deployFailed && (
          <ErrorText>
            Sorry, unable to create wallet. Please try again later.
          </ErrorText>
        )}
      </AccountList>
      {hasHiddenAccounts && (
        <button onClick={() => navigate(routes.accountsHidden())}>
          Hidden accounts
        </button>
      )}
    </AccountListWrapper>
  )
}
