import { Empty, EmptyButton, icons } from "@argent/ui"
import { partition } from "lodash-es"
import { FC, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../routes"
import { useCurrentNetwork } from "../networks/useNetworks"
import { AccountNavigationBar } from "./AccountNavigationBar"
import { isHiddenAccount, useAccounts } from "./accounts.state"
import { HiddenAccountsBar } from "./HiddenAccountsBar"
import { autoSelectAccountOnNetwork } from "./switchAccount"

const { WalletIcon, AddIcon } = icons

export const AccountScreenEmpty: FC = () => {
  const currentNetwork = useCurrentNetwork()
  const navigate = useNavigate()
  const allAccounts = useAccounts({ showHidden: true })
  const [hiddenAccounts, visibleAccounts] = partition(
    allAccounts,
    isHiddenAccount,
  )
  const hasVisibleAccounts = visibleAccounts.length > 0
  const hasHiddenAccounts = hiddenAccounts.length > 0
  useEffect(() => {
    /** User made some account visible then returned to this screen */
    if (hasVisibleAccounts) {
      autoSelectAccountOnNetwork(currentNetwork.id)
    }
  }, [currentNetwork.id, hasVisibleAccounts])
  return (
    <>
      <AccountNavigationBar showAccountButton={false} />
      <Empty
        icon={<WalletIcon />}
        title={`You have no ${hasHiddenAccounts ? "visible " : ""}accounts on ${
          currentNetwork.name
        }`}
      >
        <EmptyButton
          leftIcon={<AddIcon />}
          onClick={() => navigate(routes.newAccount())}
        >
          Create account
        </EmptyButton>
      </Empty>
      {hasHiddenAccounts && <HiddenAccountsBar />}
    </>
  )
}
