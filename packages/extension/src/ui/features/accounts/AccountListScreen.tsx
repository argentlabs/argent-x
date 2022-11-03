import {
  BarCloseButton,
  BarIconButton,
  NavigationBar,
  ScrollContainer,
  icons,
  useScroll,
} from "@argent/ui"
import { partition, some } from "lodash-es"
import { FC, useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { useAppState } from "../../app.state"
import { IconButton } from "../../components/IconButton"
import { VisibilityOff } from "../../components/Icons/MuiIcons"
import { ResponsiveFixedBox } from "../../components/Responsive"
import { Spinner } from "../../components/Spinner"
import { routes, useReturnTo } from "../../routes"
import { makeClickable } from "../../services/a11y"
import { connectAccount } from "../../services/backgroundAccounts"
import { P } from "../../theme/Typography"
import { LoadingScreen } from "../actions/LoadingScreen"
import { useCurrentNetwork } from "../networks/useNetworks"
import { useBackupRequired } from "../recovery/backupDownload.state"
import { recover } from "../recovery/recovery.service"
import { RecoveryBanner } from "../recovery/RecoveryBanner"
import { AccountListScreenItem } from "./AccountListScreenItem"
import { createAccount } from "./accounts.service"
import {
  isHiddenAccount,
  useAccounts,
  useSelectedAccountStore,
} from "./accounts.state"
import { DeprecatedAccountsWarning } from "./DeprecatedAccountsWarning"
import { usePartitionDeprecatedAccounts } from "./upgrade.service"

const { AddIcon } = icons

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

const Footer = styled(ResponsiveFixedBox)`
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
  const returnTo = useReturnTo()
  const { switcherNetworkId } = useAppState()
  const { selectedAccount } = useSelectedAccountStore()
  const allAccounts = useAccounts({ showHidden: true })
  const [hiddenAccounts, visibleAccounts] = partition(
    allAccounts,
    isHiddenAccount,
  )
  const { isBackupRequired } = useBackupRequired()
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployFailed, setDeployFailed] = useState(false)
  const currentNetwork = useCurrentNetwork()

  const { data: partitionedAccounts } = usePartitionDeprecatedAccounts(
    visibleAccounts,
    currentNetwork,
  )
  const hasHiddenAccounts = hiddenAccounts.length > 0

  const handleAddAccount = useCallback(async () => {
    setIsDeploying(true)
    setDeployFailed(false)
    try {
      const newAccount = await createAccount(switcherNetworkId)
      connectAccount(newAccount)
      navigate(await recover())
    } catch {
      setDeployFailed(true)
    } finally {
      setIsDeploying(false)
    }
  }, [navigate, switcherNetworkId])

  const { scrollRef, scroll } = useScroll()

  const onClose = useCallback(() => {
    if (returnTo) {
      navigate(returnTo)
    } else {
      navigate(-1)
    }
  }, [navigate, returnTo])

  if (!partitionedAccounts) {
    return <LoadingScreen />
  }

  const [deprecatedAccounts, newAccounts] = partitionedAccounts

  return (
    <>
      <NavigationBar
        scroll={scroll}
        leftButton={<BarCloseButton onClick={onClose} disabled={isDeploying} />}
        title={"My accounts"}
        rightButton={
          <BarIconButton
            aria-label="Create new wallet"
            onClick={handleAddAccount}
            isLoading={isDeploying}
          >
            <AddIcon />
          </BarIconButton>
        }
      />
      <ScrollContainer ref={scrollRef}>
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
              {...makeClickable(handleAddAccount, {
                label: "Create new wallet",
              })}
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
              onClick={() => navigate(routes.accountsHidden(switcherNetworkId))}
            >
              <HiddenAccountsButtonIcon>
                <VisibilityOff fontSize="inherit" />
              </HiddenAccountsButtonIcon>
              <div>Hidden accounts</div>
            </HiddenAccountsButton>
          </Footer>
        )}
      </ScrollContainer>
    </>
  )
}
