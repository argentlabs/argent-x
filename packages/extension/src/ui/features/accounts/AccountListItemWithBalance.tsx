import type { FC } from "react"

import type { BaseWalletAccount } from "../../../shared/wallet.model"
import { usePrettyBalanceForAccount } from "../accountTokens/usePrettyBalance"
import { AccountListItem } from "./AccountListItem"
import type { AccountListItemProps } from "./accountListItem.model"

interface AccountListItemWithBalanceProps extends AccountListItemProps {
  account: BaseWalletAccount
}

export const AccountListItemWithBalance: FC<
  AccountListItemWithBalanceProps
> = ({ account, ...rest }) => {
  const prettyAccountBalance = usePrettyBalanceForAccount(account)
  return <AccountListItem accountDescription={prettyAccountBalance} {...rest} />
}
