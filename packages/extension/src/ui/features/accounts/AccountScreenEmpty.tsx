import {
  WalletSecondaryIcon,
  PlusSecondaryIcon,
  HideSecondaryIcon,
} from "@argent/x-ui/icons"
import { Empty, EmptyButton } from "@argent/x-ui"
import type { FC, ReactEventHandler } from "react"

import { AccountListFooter } from "./AccountListFooter"

interface AccountScreenEmptyProps {
  hasHiddenAccounts: boolean
  currentNetworkName: string
  onAddAccount: ReactEventHandler
  onHiddenAccounts: ReactEventHandler
  showAddButton?: boolean
  showHideButton?: boolean
}

export const AccountScreenEmpty: FC<AccountScreenEmptyProps> = ({
  hasHiddenAccounts,
  currentNetworkName,
  onAddAccount,
  onHiddenAccounts,
  showAddButton = true,
  showHideButton = true,
}) => {
  return (
    <>
      <Empty
        icon={<WalletSecondaryIcon />}
        title={`You have no ${
          hasHiddenAccounts ? "visible " : ""
        }accounts on ${currentNetworkName}`}
      >
        {hasHiddenAccounts && showHideButton && (
          <EmptyButton
            mt={8}
            leftIcon={<HideSecondaryIcon />}
            onClick={onHiddenAccounts}
          >
            Hidden accounts
          </EmptyButton>
        )}
      </Empty>
      {showAddButton && (
        <AccountListFooter
          data-testid="create-account-button"
          onClick={onAddAccount}
          icon={<PlusSecondaryIcon />}
          text={"Add account"}
        />
      )}
    </>
  )
}
