import { FC } from "react"

import { Account } from "../../accounts/Account"
import {
  AccountListItem,
  AccountListItemProps,
} from "../../accounts/AccountListItem"

interface IConnectDappAccountListItem
  extends Omit<
    AccountListItemProps,
    "accountName" | "accountAddress" | "networkId"
  > {
  account: Account
}

export const ConnectDappAccountListItem: FC<IConnectDappAccountListItem> = ({
  account,
  ...rest
}) => {
  return (
    <AccountListItem
      accountName={account.name}
      accountAddress={account.address}
      networkId={account.networkId}
      {...rest}
    />
  )
}
