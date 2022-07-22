import { FC } from "react"

import { makeClickable } from "../../services/a11y"
import { unhideAccount } from "../../services/backgroundAccounts"
import { updateAccountsStateFromWallet } from "../recovery/recovery.service"
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
        await unhideAccount(account.address, account.networkId)
        // TODO: refactor - currently explicit sync wallet state into UI store, should be reactive
        await updateAccountsStateFromWallet(account.networkId)
      })}
      accountName={accountName}
      accountAddress={account.address}
      networkId={account.networkId}
      hidden
    />
  )
}
