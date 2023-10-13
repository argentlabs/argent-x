import {
  BarCloseButton,
  BarIconButton,
  CellStack,
  NavigationContainer,
  icons,
} from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { isEmpty, some } from "lodash-es"
import { FC, ReactEventHandler } from "react"

import { PendingMultisig } from "../../../shared/multisig/types"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { MultisigListAccounts } from "../multisig/MultisigListAccounts"
import { Account } from "./Account"
import { AccountListScreenItemContainer } from "./AccountListScreenItemContainer"
import { DeprecatedAccountsWarning } from "./DeprecatedAccountsWarning"
import { GroupedAccountList } from "./GroupedAccountList"
import { HiddenAccountsBarContainer } from "./HiddenAccountsBar"
import { AccountListItemSkeleton } from "./AccountListItemSkeleton"

const { AddIcon, WalletIcon, MultisigIcon } = icons

interface AccountListScreenProps {
  isLoading: boolean
  deprecatedAccounts: Account[]
  hiddenAccounts: BaseWalletAccount[]
  hiddenPendingMultisigs: PendingMultisig[]
  multisigAccounts: Account[]
  accounts: Account[]
  onAdd: () => void
  onClose: ReactEventHandler
  pendingMultisigs: PendingMultisig[]
  returnTo?: string
  selectedAccount?: BaseWalletAccount
  standardAccounts: Account[]
  title: string
  visiblePendingMultisigs: PendingMultisig[]
}

export const AccountListScreen: FC<AccountListScreenProps> = ({
  isLoading,
  deprecatedAccounts,
  hiddenAccounts,
  hiddenPendingMultisigs,
  multisigAccounts,
  accounts,
  onAdd,
  onClose,
  pendingMultisigs,
  returnTo,
  selectedAccount,
  standardAccounts,
  title,
  visiblePendingMultisigs,
}) => {
  const hasHiddenAccounts =
    hiddenAccounts.length > 0 || hiddenPendingMultisigs.length > 0

  const hasMultisigAccounts =
    !isEmpty(multisigAccounts) || !isEmpty(pendingMultisigs)

  const hasMultipleAccountTypes =
    !isEmpty(standardAccounts) && hasMultisigAccounts

  const hasOnlyMultisigAccounts =
    hasMultisigAccounts && isEmpty(standardAccounts)

  const hasDeprecatedAccounts = some(deprecatedAccounts)
  return (
    <>
      <NavigationContainer
        leftButton={<BarCloseButton onClick={onClose} />}
        title={title}
        rightButton={
          <BarIconButton aria-label="Create new wallet" onClick={onAdd}>
            <AddIcon />
          </BarIconButton>
        }
      >
        {isLoading ? (
          <CellStack pt={0}>
            <AccountListItemSkeleton />
            <AccountListItemSkeleton />
            <AccountListItemSkeleton />
          </CellStack>
        ) : (
          <CellStack pt={0}>
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
                  pendingMultisigs={visiblePendingMultisigs}
                />
              </Flex>
            ) : hasOnlyMultisigAccounts ? (
              <MultisigListAccounts
                accounts={accounts}
                pendingMultisigs={visiblePendingMultisigs}
                selectedAccount={selectedAccount}
                returnTo={returnTo}
              />
            ) : (
              standardAccounts.map((account) => (
                <AccountListScreenItemContainer
                  key={account.address}
                  account={account}
                  selectedAccount={selectedAccount}
                  returnTo={returnTo}
                />
              ))
            )}
            {hasDeprecatedAccounts && (
              <>
                <DeprecatedAccountsWarning />
                {deprecatedAccounts.map((account) => (
                  <AccountListScreenItemContainer
                    key={account.address}
                    account={account}
                    selectedAccount={selectedAccount}
                    returnTo={returnTo}
                    needsUpgrade
                  />
                ))}
              </>
            )}
          </CellStack>
        )}
      </NavigationContainer>
      {hasHiddenAccounts && <HiddenAccountsBarContainer />}
    </>
  )
}
