import {
  BarCloseButton,
  BarIconButton,
  NavigationContainer,
  icons,
} from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { isEmpty, partition, some } from "lodash-es"
import { FC, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { routes, useReturnTo } from "../../routes"
import { isEqualAddress } from "../../services/addresses"
import { P } from "../../theme/Typography"
import { LoadingScreen } from "../actions/LoadingScreen"
import { usePendingMultisigs } from "../multisig/multisig.state"
import { MultisigListScreenItem } from "../multisig/MultisigListScreenItem"
import { useCurrentNetwork } from "../networks/useNetworks"
import { useBackupRequired } from "../recovery/backupDownload.state"
import { recover } from "../recovery/recovery.service"
import { RecoveryBanner } from "../recovery/RecoveryBanner"
import { Account } from "./Account"
import { AccountListScreenItem } from "./AccountListScreenItem"
import {
  isHiddenAccount,
  useAccounts,
  useSelectedAccount,
} from "./accounts.state"
import { DeprecatedAccountsWarning } from "./DeprecatedAccountsWarning"
import { GroupedAccountList } from "./GroupedAccountList"
import { HiddenAccountsBar } from "./HiddenAccountsBar"
import { usePartitionDeprecatedAccounts } from "./upgrade.service"
import { useAddAccount } from "./useAddAccount"

const { AddIcon, WalletIcon, MultisigIcon } = icons

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
  const pendingMultisigs = usePendingMultisigs()
  console.log(
    "🚀 ~ file: AccountListScreen.tsx:58 ~ pendingMultisigs:",
    pendingMultisigs,
  )
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

  const fullPartitionedAccounts = useMemo(() => {
    if (!partitionedAccounts) {
      return
    }

    const [newAccounts, deprecatedAccounts] = partitionedAccounts

    const deprecatedFullAccounts = deprecatedAccounts
      .map((accountAddress) => accountFromAddress(accountAddress))
      .filter((account): account is Account => Boolean(account))

    const newFullAccounts = newAccounts
      .map((accountAddress) => accountFromAddress(accountAddress))
      .filter((account): account is Account => Boolean(account))

    return [newFullAccounts, deprecatedFullAccounts]
  }, [accountFromAddress, partitionedAccounts])

  const onClose = useCallback(async () => {
    if (returnTo) {
      navigate(returnTo)
    } else {
      navigate(await recover())
    }
  }, [navigate, returnTo])

  if (!fullPartitionedAccounts) {
    return <LoadingScreen />
  }

  const [newAccounts, deprecatedAccounts] = fullPartitionedAccounts

  const [multisigAccounts, standardAccounts] = partition(
    newAccounts,
    (account) => account.type === "multisig",
  )

  const hasMultisigAccounts =
    !isEmpty(multisigAccounts) || !isEmpty(pendingMultisigs)

  const hasMultipleAccountTypes =
    !isEmpty(standardAccounts) && hasMultisigAccounts

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
          {hasMultipleAccountTypes ? (
            <Flex direction="column" gap={6}>
              <GroupedAccountList
                title="Standard Accounts"
                accounts={standardAccounts}
                icon={<WalletIcon w={4} h={4} />}
                selectedAccount={selectedAccount}
                returnTo={returnTo}
                type="standard"
              />
              <GroupedAccountList
                title="Multisig Accounts"
                accounts={multisigAccounts}
                icon={<MultisigIcon w={4} h={4} />}
                selectedAccount={selectedAccount}
                returnTo={returnTo}
                type="multisig"
                pendingMultisigs={pendingMultisigs}
              />
            </Flex>
          ) : (
            newAccounts.map((account) =>
              account.type === "multisig" ? (
                <MultisigListScreenItem
                  key={account.address}
                  account={account}
                  selectedAccount={selectedAccount}
                  returnTo={returnTo}
                />
              ) : (
                <AccountListScreenItem
                  key={account.address}
                  account={account}
                  selectedAccount={selectedAccount}
                  returnTo={returnTo}
                />
              ),
            )
          )}
          {some(deprecatedAccounts) && (
            <>
              <DeprecatedAccountsWarning />
              {deprecatedAccounts.map((account) => (
                <AccountListScreenItem
                  key={account.address}
                  account={account}
                  selectedAccount={selectedAccount}
                  returnTo={returnTo}
                  needsUpgrade
                />
              ))}
            </>
          )}
          {isAdding && <DimmingContainer />}
        </Flex>
      </NavigationContainer>
      {hasHiddenAccounts && <HiddenAccountsBar />}
    </>
  )
}
