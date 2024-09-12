import { Empty, EmptyButton, iconsDeprecated } from "@argent/x-ui"
import { FC, ReactEventHandler } from "react"

import { AccountListFooterContainer } from "./AccountListFooterContainer"

const { WalletIcon, AddIcon } = iconsDeprecated

interface AccountScreenEmptyProps {
  hasHiddenAccounts: boolean
  currentNetworkName: string
  onCreate: ReactEventHandler
}

export const AccountScreenEmpty: FC<AccountScreenEmptyProps> = ({
  hasHiddenAccounts,
  currentNetworkName,
  onCreate,
}) => {
  return (
    <>
      <Empty
        icon={<WalletIcon />}
        title={`You have no ${
          hasHiddenAccounts ? "visible " : ""
        }accounts on ${currentNetworkName}`}
      >
        <EmptyButton mt={8} leftIcon={<AddIcon />} onClick={onCreate}>
          Create account
        </EmptyButton>
      </Empty>
      {hasHiddenAccounts && <AccountListFooterContainer isHiddenAccounts />}
    </>
  )
}
