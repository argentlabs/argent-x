import { FC } from "react"

import { useLiveAccountEscape } from "../smartAccount/escape/useAccountEscape"
import { AccountListItemProps } from "./accountListItem.model"
import { AccountListItemSmartAccountBadge } from "./AccountListItemSmartAccountBadge"
import { useWalletAccount } from "./accounts.state"

type AccountListItemSmartAccountBadgeContainerProps = Pick<
  AccountListItemProps,
  "accountAddress" | "networkId"
>

export const AccountListItemSmartAccountBadgeContainer: FC<
  AccountListItemSmartAccountBadgeContainerProps
> = ({ accountAddress, networkId }) => {
  const account = useWalletAccount({ address: accountAddress, networkId })
  const liveAccountEscape = useLiveAccountEscape(account)
  return (
    <AccountListItemSmartAccountBadge liveAccountEscape={liveAccountEscape} />
  )
}
