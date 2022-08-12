import { FC } from "react"

import { unhideAccount } from "../../../shared/account/store"
import { makeClickable } from "../../services/a11y"
import { Account } from "./Account"
import { AccountListItem } from "./AccountListItem"
import { getAccountName, useAccountMetadata } from "./accountMetadata.state"

interface IAccountListHiddenScreenItem {
  account: Account
}

export const AccountListHiddenScreenItem: FC<IAccountListHiddenScreenItem> = ({
  account,
}) => {
  const { accountNames } = useAccountMetadata()
  const accountName = getAccountName(account, accountNames)
  return (
    <AccountListItem
      {...makeClickable(async () => {
        // update the state in the wallet
        await unhideAccount(account)
      })}
      accountName={accountName}
      accountAddress={account.address}
      networkId={account.networkId}
      accountType={account.type}
      hidden
    />
  )
}
