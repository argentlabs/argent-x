import {
  BarCloseButton,
  BarIconButton,
  CellStack,
  NavigationContainer,
  iconsDeprecated,
} from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import { isEmpty, some } from "lodash-es"
import { FC, ReactEventHandler } from "react"

import { PendingMultisig } from "../../../shared/multisig/types"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { Account } from "./Account"
import { AccountListFooterContainer } from "./AccountListFooterContainer"
import { AccountListScreenItemContainer } from "./AccountListScreenItemContainer"
import { DeprecatedAccountsWarning } from "./DeprecatedAccountsWarning"
import { GroupedAccountList } from "./GroupedAccountList"

const { AddIcon, WalletIcon, MultisigIcon } = iconsDeprecated

interface AccountListScreenProps {
  deprecatedAccounts?: Account[] // deprecated accounts are different from upgradeable accounts. Should remove this prop in future
  hiddenAccounts: BaseWalletAccount[]
  hiddenPendingMultisigs: PendingMultisig[]
  multisigAccounts: Account[]
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
  deprecatedAccounts = [],
  hiddenAccounts,
  hiddenPendingMultisigs,
  multisigAccounts,
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

  const hasStandardAccounts = !isEmpty(standardAccounts)

  const hasAccounts = hasStandardAccounts || hasMultisigAccounts

  const hasDeprecatedAccounts = some(deprecatedAccounts)

  const hasMultipleAccountTypes =
    !isEmpty(standardAccounts) && hasMultisigAccounts

  const showMultisigGroupTitle =
    hasMultipleAccountTypes || multisigAccounts.length > 1

  const showStandardGroupTitle =
    hasMultipleAccountTypes || multisigAccounts.length > 1

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
        <CellStack pt={0}>
          <Flex direction="column" gap={6}>
            {hasStandardAccounts && (
              <GroupedAccountList
                title="My accounts"
                accounts={standardAccounts}
                icon={<WalletIcon w={4} h={4} />}
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
                icon={<MultisigIcon w={4} h={4} />}
                selectedAccount={selectedAccount}
                returnTo={returnTo}
                type="multisig"
                pendingMultisigs={visiblePendingMultisigs}
                showTitle={showMultisigGroupTitle}
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
      </NavigationContainer>
      <AccountListFooterContainer
        isHiddenAccounts={!hasAccounts && hasHiddenAccounts}
      />
    </>
  )
}
