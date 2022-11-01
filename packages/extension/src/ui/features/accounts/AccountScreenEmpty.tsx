import { Empty, EmptyButton, FieldError, icons } from "@argent/ui"
import { partition } from "lodash-es"
import { FC, useEffect } from "react"

import { useCurrentNetwork } from "../networks/useNetworks"
import { AccountHeader } from "./AccountHeader"
import { isHiddenAccount, useAccounts } from "./accounts.state"
import { HiddenAccountsBar } from "./HiddenAccountsBar"
import { autoSelectAccountOnNetwork } from "./switchAccount"
import { useAddAccount } from "./useAddAccount"

const { WalletIcon, AddIcon } = icons

export const AccountScreenEmpty: FC = () => {
  const currentNetwork = useCurrentNetwork()
  const { addAccount, isDeploying, deployFailed } = useAddAccount()
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
      <AccountHeader showAccountButton={false} />
      <Empty
        icon={<WalletIcon />}
        title={`You have no ${hasHiddenAccounts ? "visible " : ""}accounts on ${
          currentNetwork.name
        }`}
      >
        <EmptyButton
          leftIcon={<AddIcon />}
          onClick={addAccount}
          isLoading={isDeploying}
          isDisabled={isDeploying}
          loadingText={"Creating"}
        >
          Create account
        </EmptyButton>
        {deployFailed && (
          <FieldError pt={1}>
            Sorry, unable to create wallet. Please try again later.
          </FieldError>
        )}
      </Empty>
      {hasHiddenAccounts && <HiddenAccountsBar />}
    </>
  )
}
