import { icons } from "@argent/x-ui"
import type { FC, ReactEventHandler } from "react"

import { AccountListItem } from "./AccountListItem"
import type { AccountListItemProps } from "./accountListItem.model"

const { ChevronRightSecondaryIcon } = icons

interface AccountListScreenItemProps extends AccountListItemProps {
  clickNavigateSettings?: boolean
  onClick: ReactEventHandler
}

export const AccountListScreenItem: FC<AccountListScreenItemProps> = ({
  accountName,
  clickNavigateSettings,
  ...rest
}) => {
  return (
    <AccountListItem
      aria-label={`Select ${accountName}`}
      accountName={accountName}
      pr={5}
      w="full"
      rightElementFlexProps={{
        flexDirection: "row",
        gap: 2,
        alignItems: "center",
      }}
      {...rest}
    >
      {clickNavigateSettings && <ChevronRightSecondaryIcon opacity={0.6} />}
    </AccountListItem>
  )
}
