import {
  BarCloseButton,
  BarIconButton,
  NavigationBar,
  ScrollContainer,
  icons,
  useScroll,
} from "@argent/ui"
import { partition, some } from "lodash-es"
import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { IconButton } from "../../components/IconButton"
import { ResponsiveFixedBox } from "../../components/Responsive"
import { Spinner } from "../../components/Spinner"
import { useReturnTo } from "../../routes"
import { makeClickable } from "../../services/a11y"
import { P } from "../../theme/Typography"
import { LoadingScreen } from "../actions/LoadingScreen"
import { useCurrentNetwork } from "../networks/useNetworks"
import { useBackupRequired } from "../recovery/backupDownload.state"
import { recover } from "../recovery/recovery.service"
import { RecoveryBanner } from "../recovery/RecoveryBanner"
import { AccountListScreenItem } from "./AccountListScreenItem"
import {
  isHiddenAccount,
  useAccounts,
  useSelectedAccountStore,
} from "./accounts.state"
import { DeprecatedAccountsWarning } from "./DeprecatedAccountsWarning"
import { HiddenAccountsBar } from "./HiddenAccountsBar"
import { usePartitionDeprecatedAccounts } from "./upgrade.service"
import { useAddAccount } from "./useAddAccount"

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
  bottom: 0;
  background-color: ${({ theme }) => theme.bg1};
  background: linear-gradient(
    180deg,
    rgba(16, 16, 16, 0.4) 0%,
    ${({ theme }) => theme.bg1} 73.72%
  );
  box-shadow: 0px 2px 12px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(10px);
  z-index: 100;
  display: flex;
  flex-direction: column;
`

export const AccountListScreen: FC = () => {
  const navigate = useNavigate()
  const returnTo = useReturnTo()
  const { selectedAccount } = useSelectedAccountStore()
  const allAccounts = useAccounts({ showHidden: true })
  const [hiddenAccounts, visibleAccounts] = partition(
    allAccounts,
    isHiddenAccount,
  )
  const { isBackupRequired } = useBackupRequired()
  const currentNetwork = useCurrentNetwork()
  const { addAccount, isDeploying, deployFailed } = useAddAccount()

  const { data: partitionedAccounts } = usePartitionDeprecatedAccounts(
    visibleAccounts,
    currentNetwork,
  )
  const hasHiddenAccounts = hiddenAccounts.length > 0

  const { scrollRef, scroll } = useScroll()

  const onClose = useCallback(async () => {
    if (returnTo) {
      navigate(returnTo)
    } else {
      navigate(await recover())
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
            onClick={addAccount}
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
              {...makeClickable(addAccount, {
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
            <HiddenAccountsBar />
          </Footer>
        )}
      </ScrollContainer>
    </>
  )
}
