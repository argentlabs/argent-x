import { partition, some } from "lodash-es"
import { FC, useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { isDeprecated } from "../../../shared/wallet.service"
import { useAppState } from "../../app.state"
import { Header } from "../../components/Header"
import { IconButton } from "../../components/IconButton"
import {
  AddIcon,
  SettingsIcon,
  VisibilityOff,
} from "../../components/Icons/MuiIcons"
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
  isHiddenAccount,
  useAccounts,
  useSelectedAccountStore,
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

const Footer = styled.div`
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

const HiddenAccountsButton = styled.button`
  appearance: none;
  border: none;
  background: none;
  color: ${({ theme }) => theme.text3};
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 200ms ease-in-out;
  &:hover {
    color: ${({ theme }) => theme.text2};
  }
`

const HiddenAccountsButtonIcon = styled.div`
  font-size: 14px;
`

export const AccountListScreen: FC = () => {
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()
  const { selectedAccount } = useSelectedAccountStore()
  const allAccounts = useAccounts(true)
  const [hiddenAccounts, visibleAccounts] = partition(
    allAccounts,
    isHiddenAccount,
  )
  const { isBackupRequired } = useBackupRequired()
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployFailed, setDeployFailed] = useState(false)

  const [deprecatedAccounts, newAccounts] = partition(
    visibleAccounts,
    (account) => isDeprecated(account),
  )
  const hasHiddenAccounts = hiddenAccounts.length > 0

  const handleAddAccount = useCallback(async () => {
    setIsDeploying(true)
    setDeployFailed(false)
    try {
      const newAccount = await deployAccount(switcherNetworkId)
      connectAccount(newAccount)
      navigate(await recover())
    } catch {
      setDeployFailed(true)
    } finally {
      setIsDeploying(false)
    }
  }, [navigate, switcherNetworkId])

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
        {visibleAccounts.length === 0 && (
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
        <Footer>
          <HiddenAccountsButton
            onClick={() => navigate(routes.accountsHidden())}
          >
            <HiddenAccountsButtonIcon>
              <VisibilityOff fontSize="inherit" />
            </HiddenAccountsButtonIcon>
            <div>Hidden accounts</div>
          </HiddenAccountsButton>
        </Footer>
      )}
    </AccountListWrapper>
  )
}
