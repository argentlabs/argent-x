import { FC } from "react"

import { useLiveAccountEscape } from "../shield/escape/useAccountEscape"
import { AccountListItemProps } from "./accountListItem.model"
import { AccountListItemShieldBadge } from "./AccountListItemShieldBadge"
import { useAccount } from "./accounts.state"

type AccountListItemShieldBadgeContainerProps = Pick<
  AccountListItemProps,
  "accountAddress" | "networkId"
>

export const AccountListItemShieldBadgeContainer: FC<
  AccountListItemShieldBadgeContainerProps
> = ({ accountAddress, networkId }) => {
  const account = useAccount({ address: accountAddress, networkId })
  const liveAccountEscape = useLiveAccountEscape(account) // TODO: should not be needed when data layer was restructered, as all properties can be considered real time at that point.
  return <AccountListItemShieldBadge liveAccountEscape={liveAccountEscape} />
}
