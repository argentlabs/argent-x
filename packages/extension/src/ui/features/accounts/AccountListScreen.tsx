import {
  BarCloseButton,
  BarIconButton,
  NavigationContainer,
  icons,
} from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { partition, some } from "lodash-es"
import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { ResponsiveFixedBox } from "../../components/Responsive"
import { useReturnTo } from "../../routes"
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
  useSelectedAccount,
} from "./accounts.state"
import { DeprecatedAccountsWarning } from "./DeprecatedAccountsWarning"
import { HiddenAccountsBar } from "./HiddenAccountsBar"
import { usePartitionDeprecatedAccounts } from "./upgrade.service"
import { useAddAccount } from "./useAddAccount"

const { AddIcon } = icons

const Paragraph = styled(P)`
  text-align: center;
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
  const selectedAccount = useSelectedAccount()
  const allAccounts = useAccounts({ showHidden: true })
  const [hiddenAccounts, visibleAccounts] = partition(
    allAccounts,
    isHiddenAccount,
  )
  const { isBackupRequired } = useBackupRequired()
  const currentNetwork = useCurrentNetwork()
  const { addAccount, isDeploying } = useAddAccount()

  const { data: partitionedAccounts } = usePartitionDeprecatedAccounts(
    visibleAccounts,
    currentNetwork,
  )
  const hasHiddenAccounts = hiddenAccounts.length > 0

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
      <NavigationContainer
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
      >
        <Flex p={4} gap={2} direction="column">
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
          {isDeploying && <DimmingContainer />}
        </Flex>
      </NavigationContainer>
      {hasHiddenAccounts && (
        <Footer>
          <HiddenAccountsBar />
        </Footer>
      )}
    </>
  )
}
