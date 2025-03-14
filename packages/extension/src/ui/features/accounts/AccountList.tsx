import {
  WalletSecondaryIcon,
  MultisigSecondaryIcon,
  ImportIcon,
  PlusSecondaryIcon,
} from "@argent/x-ui/icons"
import { CellStack, H5, MassiveTitle, ScrollContainer } from "@argent/x-ui"
import { Center, Flex, Skeleton } from "@chakra-ui/react"
import { isEmpty, some } from "lodash-es"
import type { FC } from "react"

import type { PendingMultisig } from "../../../shared/multisig/types"
import type {
  BaseWalletAccount,
  WalletAccount,
} from "../../../shared/wallet.model"
import { AccountListScreenItemContainer } from "./AccountListScreenItemContainer"
import { DeprecatedAccountsWarning } from "./DeprecatedAccountsWarning"
import { GroupedAccountList } from "./GroupedAccountList"
import { AccountScreenEmptyContainer } from "./AccountScreenEmptyContainer"
import { PrettyBalanceForNetwork } from "../accountTokens/PrettyBalance"
import { AccountListItemSkeleton } from "./AccountListItemSkeleton"
import { AccountListFooter } from "./AccountListFooter"

export const AccountListSkeleton: FC = () => {
  return (
    <CellStack py={0}>
      <Center py={4}>
        <Skeleton rounded="full" w={24}>
          <MassiveTitle>&nbsp;</MassiveTitle>
        </Skeleton>
      </Center>
      <Skeleton rounded="base" width="33.3%">
        <H5>&nbsp;</H5>
      </Skeleton>
      <AccountListItemSkeleton />
      <AccountListItemSkeleton />
      <AccountListItemSkeleton />
    </CellStack>
  )
}

interface AccountListProps {
  deprecatedAccounts?: WalletAccount[] // deprecated accounts are different from upgradeable accounts. Should remove this prop in future
  multisigAccounts: WalletAccount[]
  pendingMultisigs: PendingMultisig[]
  returnTo?: string
  selectedAccount?: BaseWalletAccount
  standardAccounts: WalletAccount[]
  importedAccounts: WalletAccount[]
  visiblePendingMultisigs: PendingMultisig[]
  networkId: string
  onAddAccount: () => void
}

export const AccountList: FC<AccountListProps> = ({
  deprecatedAccounts = [],
  multisigAccounts,
  pendingMultisigs,
  returnTo,
  selectedAccount,
  standardAccounts,
  importedAccounts,
  visiblePendingMultisigs,
  networkId,
  onAddAccount,
}) => {
  const hasMultisigAccounts =
    !isEmpty(multisigAccounts) || !isEmpty(pendingMultisigs)
  const hasStandardAccounts = !isEmpty(standardAccounts)
  const hasImportedAccounts = !isEmpty(importedAccounts)
  const hasAccounts =
    hasStandardAccounts || hasMultisigAccounts || hasImportedAccounts
  const hasDeprecatedAccounts = some(deprecatedAccounts)
  const hasMultipleAccountTypes =
    [hasStandardAccounts, hasMultisigAccounts, hasImportedAccounts].filter(
      Boolean,
    ).length > 1
  const showMultisigGroupTitle =
    hasMultipleAccountTypes || multisigAccounts.length > 1
  const showStandardGroupTitle =
    hasMultipleAccountTypes || multisigAccounts.length > 1

  return (
    <>
      {hasAccounts ? (
        <ScrollContainer>
          <CellStack pt={0}>
            <Center py={4}>
              <MassiveTitle>
                <PrettyBalanceForNetwork networkId={networkId} />
              </MassiveTitle>
            </Center>
            <Flex direction="column" gap={6}>
              {hasStandardAccounts && (
                <GroupedAccountList
                  title="My accounts"
                  accounts={standardAccounts}
                  icon={<WalletSecondaryIcon w={4} h={4} />}
                  selectedAccount={selectedAccount}
                  returnTo={returnTo}
                  type="standard"
                  showTitle={showStandardGroupTitle}
                />
              )}
              {hasMultisigAccounts && (
                <GroupedAccountList
                  title="Multisig Accounts"
                  accounts={multisigAccounts}
                  icon={<MultisigSecondaryIcon w={4} h={4} />}
                  selectedAccount={selectedAccount}
                  returnTo={returnTo}
                  type="multisig"
                  pendingMultisigs={visiblePendingMultisigs}
                  showTitle={showMultisigGroupTitle}
                />
              )}
              {hasImportedAccounts && (
                <GroupedAccountList
                  title="Imported accounts"
                  accounts={importedAccounts}
                  icon={<ImportIcon w={4} h={4} />}
                  selectedAccount={selectedAccount}
                  returnTo={returnTo}
                  type="standard"
                  showTitle={true}
                />
              )}
            </Flex>
            {hasDeprecatedAccounts && (
              <>
                <DeprecatedAccountsWarning />
                {deprecatedAccounts.map((account) => (
                  <AccountListScreenItemContainer
                    key={account.address}
                    account={account}
                    selectedAccount={selectedAccount}
                    returnTo={returnTo}
                  />
                ))}
              </>
            )}
          </CellStack>
        </ScrollContainer>
      ) : (
        <AccountScreenEmptyContainer
          showAddButton={false}
          networkId={networkId}
        />
      )}
      <AccountListFooter
        data-testid="create-account-button"
        onClick={onAddAccount}
        icon={<PlusSecondaryIcon />}
        text={"Add account"}
      />
    </>
  )
}
