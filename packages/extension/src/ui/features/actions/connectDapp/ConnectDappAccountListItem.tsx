import { FC } from "react"

import { Account } from "../../accounts/Account"
import {
  AccountListItem,
  IAccountListItem,
} from "../../accounts/AccountListItem"
import {
  getAccountName,
  useAccountMetadata,
} from "../../accounts/accountMetadata.state"

interface IConnectDappAccountListItem
  extends Omit<
    IAccountListItem,
    "accountName" | "accountAddress" | "networkId"
  > {
  account: Account
}

export const ConnectDappAccountListItem: FC<IConnectDappAccountListItem> = ({
  account,
  ...rest
}) => {
  const { accountNames } = useAccountMetadata()
  const accountName = getAccountName(account, accountNames)

  return (
    <AccountListItem
      accountName={accountName}
      accountAddress={account.address}
      networkId={account.networkId}
      {...rest}
    />
  )
}
