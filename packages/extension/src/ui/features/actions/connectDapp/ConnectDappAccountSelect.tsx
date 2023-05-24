import { FC, useCallback, useMemo } from "react"

import {
  equalPreAuthorization,
  usePreAuthorizations,
} from "../../../../shared/preAuthorizations"
import {
  BaseWalletAccount,
  WalletAccount,
} from "../../../../shared/wallet.model"
import { accountsEqual } from "../../../../shared/wallet.service"
import { AccountListItemProps } from "../../accounts/AccountListItem"
import { AccountSelect } from "../../accounts/AccountSelect"

export interface ConnectDappAccountSelectProps {
  accounts: WalletAccount[]
  selectedAccount?: BaseWalletAccount
  onSelectedAccountChange?: (account: BaseWalletAccount) => void
  host: string
}

export const ConnectDappAccountSelect: FC<ConnectDappAccountSelectProps> = ({
  accounts = [],
  selectedAccount,
  onSelectedAccountChange,
  host,
}) => {
  const preAuths = usePreAuthorizations()
  const makeAccountListItem = useCallback(
    (account: WalletAccount): AccountListItemProps => {
      const accountName = account.name
      const connected = Boolean(
        preAuths.some((preAuth) =>
          equalPreAuthorization(preAuth, {
            host,
            account,
          }),
        ),
      )
      return {
        accountName,
        accountAddress: account.address,
        networkId: account.networkId,
        connectedHost: connected ? host : undefined,
        accountType: account.type,
      }
    },
    [host, preAuths],
  )
  const accountItems = useMemo(
    () => accounts.map(makeAccountListItem),
    [accounts, makeAccountListItem],
  )
  const selectedAccountItem = useMemo(
    () =>
      accountItems.find(
        (accountItem) =>
          selectedAccount &&
          accountsEqual(
            {
              address: accountItem.accountAddress,
              networkId: accountItem.networkId,
            },
            selectedAccount,
          ),
      ),
    [accountItems, selectedAccount],
  )
  const onSelectedAccountItemChange = useCallback(
    (accountItem: AccountListItemProps) => {
      onSelectedAccountChange &&
        onSelectedAccountChange({
          address: accountItem.accountAddress,
          networkId: accountItem.networkId,
        })
    },
    [onSelectedAccountChange],
  )
  return (
    <AccountSelect
      accounts={accountItems}
      selectedAccount={selectedAccountItem}
      onSelectedAccountChange={onSelectedAccountItemChange}
    />
  )
}
