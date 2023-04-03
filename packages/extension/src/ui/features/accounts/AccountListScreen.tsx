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

import { routes, useReturnTo } from "../../routes"
import { isEqualAddress } from "../../services/addresses"
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
  const { isAdding } = useAddAccount()

  const { data: partitionedAccounts } = usePartitionDeprecatedAccounts(
    visibleAccounts,
    currentNetwork,
  )
  const hasHiddenAccounts = hiddenAccounts.length > 0

  const accountFromAddress = useCallback(
    (accountAddress: string) => {
      return allAccounts.find(
        (account) =>
          isEqualAddress(account.address, accountAddress) &&
          currentNetwork.id === account.networkId,
      )
    },
    [allAccounts, currentNetwork],
  )

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
        leftButton={<BarCloseButton onClick={onClose} disabled={isAdding} />}
        title={`${currentNetwork.name} accounts`}
        rightButton={
          <BarIconButton
            aria-label="Create new wallet"
            onClick={() => navigate(routes.newAccount())}
            isLoading={isAdding}
          >
            <AddIcon />
          </BarIconButton>
        }
      >
        <Flex p={4} gap={2} direction="column">
          {isBackupRequired && <RecoveryBanner />}
          {visibleAccounts.length === 0 && (
            <Paragraph>
              No {hasHiddenAccounts ? "visible" : ""} accounts on this network,
              click below to add one.
            </Paragraph>
          )}
          {newAccounts.map((accountAddress) => {
            const account = accountFromAddress(accountAddress)
            return account ? (
              <AccountListScreenItem
                key={account.address}
                account={account}
                selectedAccount={selectedAccount}
                returnTo={returnTo}
              />
            ) : null
          })}
          {some(deprecatedAccounts) && (
            <>
              <DeprecatedAccountsWarning />
              {deprecatedAccounts.map((accountAddress) => {
                const account = accountFromAddress(accountAddress)
                return account ? (
                  <AccountListScreenItem
                    key={account.address}
                    account={account}
                    selectedAccount={selectedAccount}
                    returnTo={returnTo}
                    needsUpgrade
                  />
                ) : null
              })}
            </>
          )}
          {isAdding && <DimmingContainer />}
        </Flex>
      </NavigationContainer>
      {hasHiddenAccounts && <HiddenAccountsBar />}
    </>
  )
}
