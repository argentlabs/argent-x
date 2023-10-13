import { Empty, EmptyButton, icons } from "@argent/ui"
import { FC, ReactEventHandler } from "react"

import { HiddenAccountsBarContainer } from "./HiddenAccountsBar"

const { WalletIcon, AddIcon } = icons

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
        <EmptyButton leftIcon={<AddIcon />} onClick={onCreate}>
          Create account
        </EmptyButton>
      </Empty>
      {hasHiddenAccounts && <HiddenAccountsBarContainer />}
    </>
  )
}
