import type { FC } from "react"

import { useLiveAccountEscape } from "../smartAccount/escape/useAccountEscape"
import type { AccountListItemProps } from "./accountListItem.model"
import { AccountListItemSmartAccountBadge } from "./AccountListItemSmartAccountBadge"
import { useWalletAccount } from "./accounts.state"

type AccountListItemSmartAccountBadgeContainerProps = Pick<
  AccountListItemProps,
  "accountId"
> & {
  size?: number | string
}

export const AccountListItemSmartAccountBadgeContainer: FC<
  AccountListItemSmartAccountBadgeContainerProps
> = ({ accountId, size }) => {
  const account = useWalletAccount(accountId)
  const liveAccountEscape = useLiveAccountEscape(account)
  return (
    <AccountListItemSmartAccountBadge
      liveAccountEscape={liveAccountEscape}
      size={size}
    />
  )
}
