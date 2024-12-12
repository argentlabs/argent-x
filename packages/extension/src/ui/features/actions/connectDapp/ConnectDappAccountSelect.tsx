import type { FC } from "react"
import { useCallback, useMemo } from "react"

import { usePreAuthorizations } from "../../preAuthorizations/hooks"
import type {
  BaseWalletAccount,
  WalletAccount,
} from "../../../../shared/wallet.model"
import { accountsEqual } from "../../../../shared/utils/accountsEqual"
import type { AccountListItemProps } from "../../accounts/accountListItem.model"
import { AccountSelect } from "../../accounts/AccountSelect"
import { isEqualPreAuthorization } from "../../../../shared/preAuthorization/schema"

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
      const { address, networkId, id } = account

      if (!account.id) {
        return {
          accountName,
          accountAddress: "",
          networkId: "",
          accountId: "",
          connectedHost: undefined,
          accountType: account.type,
        }
      }

      const connected = Boolean(
        preAuths.some((preAuth) =>
          isEqualPreAuthorization(preAuth, {
            host,
            account: {
              id: id ?? "",
              address: address ?? "",
              networkId: networkId ?? "",
            },
          }),
        ),
      )
      return {
        accountName,
        accountId: account.id ?? "",
        accountAddress: account.address ?? "",
        networkId: account.networkId ?? "",
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
              id: accountItem.accountId,
            },
            selectedAccount,
          ),
      ),
    [accountItems, selectedAccount],
  )
  const onSelectedAccountItemChange = useCallback(
    (accountItem: AccountListItemProps) => {
      if (onSelectedAccountChange) {
        onSelectedAccountChange({
          id: accountItem.accountId,
          address: accountItem.accountAddress,
          networkId: accountItem.networkId,
        })
      }
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
