import { icons } from "@argent/ui"
import { FC, ReactEventHandler } from "react"

import { AccountListItem } from "./AccountListItem"
import type { AccountListItemProps } from "./accountListItem.model"
import { AccountListScreenItemAccessory } from "./AccountListScreenItemAccessory"

const { ChevronRightIcon } = icons

interface AccountListScreenItemProps extends AccountListItemProps {
  clickNavigateSettings?: boolean
  onClick: ReactEventHandler
  shouldDisplayGuardianBanner?: boolean
}

export const AccountListScreenItem: FC<AccountListScreenItemProps> = ({
  accountName,
  accountDescription,
  onClick,
  accountAddress,
  networkId,
  accountType,
  isShield,
  avatarOutlined,
  deploying,
  upgrade,
  connectedHost,
  clickNavigateSettings,
  borderBottomRadius,
  isDeprecated,
  prettyAccountBalance,
  accountExtraInfo,
}) => {
  return (
    <AccountListItem
      aria-label={`Select ${accountName}`}
      onClick={onClick}
      accountName={accountName}
      accountAddress={accountAddress}
      accountDescription={accountDescription}
      networkId={networkId}
      accountType={accountType}
      isShield={isShield}
      avatarOutlined={avatarOutlined}
      deploying={deploying}
      upgrade={upgrade}
      connectedHost={connectedHost}
      isDeprecated={isDeprecated}
      pr={5}
      w="full"
      borderBottomRadius={borderBottomRadius}
      prettyAccountBalance={prettyAccountBalance}
      accountExtraInfo={accountExtraInfo}
    >
      {clickNavigateSettings && (
        <AccountListScreenItemAccessory>
          <ChevronRightIcon opacity={0.6} />
        </AccountListScreenItemAccessory>
      )}
    </AccountListItem>
  )
}
