import { BarBackButton, CellStack, NavigationContainer } from "@argent/ui"
import { FC } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"

import { useAppState } from "../../app.state"
import { routes, useReturnTo } from "../../routes"
import { AccountListHiddenScreenItem } from "./AccountListHiddenScreenItem"
import { isHiddenAccount, useAccountsOnNetwork } from "./accounts.state"

export const AccountListHiddenScreen: FC = () => {
  const { networkId } = useParams()
  const { switcherNetworkId } = useAppState()
  const navigate = useNavigate()

  const hiddenAccounts = useAccountsOnNetwork({
    showHidden: true,
    networkId: networkId ?? switcherNetworkId,
  }).filter(isHiddenAccount)

  const returnTo = useReturnTo()

  const hasHiddenAccounts = hiddenAccounts.length > 0
  if (!hasHiddenAccounts) {
    return <Navigate to={returnTo ? returnTo : routes.accounts()} />
  }
  return (
    <NavigationContainer
      title={"Hidden Accounts"}
      leftButton={
        <BarBackButton
          onClick={() => navigate(returnTo ? returnTo : routes.accounts())}
        />
      }
    >
      <CellStack>
        {hiddenAccounts.map((account) => (
          <AccountListHiddenScreenItem
            key={account.address}
            account={account}
          />
        ))}
      </CellStack>
    </NavigationContainer>
  )
}
