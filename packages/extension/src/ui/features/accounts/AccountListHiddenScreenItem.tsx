import { FC } from "react"

import { unhideAccount } from "../../../shared/account/store"
import { makeClickable } from "../../services/a11y"
import { Account } from "./Account"
import { AccountListItem } from "./AccountListItem"

interface IAccountListHiddenScreenItem {
  account: Account
}

export const AccountListHiddenScreenItem: FC<IAccountListHiddenScreenItem> = ({
  account,
}) => {
  return (
    <AccountListItem
      {...makeClickable(async () => {
        // update the state in the wallet
        await unhideAccount(account)
      })}
      accountName={account.name}
      accountAddress={account.address}
      networkId={account.networkId}
      accountType={account.type}
      hidden
    />
  )
}
