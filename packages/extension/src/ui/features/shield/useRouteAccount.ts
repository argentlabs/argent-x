import { useRouteAccountAddress } from "../../routes"
import { useAccount } from "../accounts/accounts.state"
import { useCurrentNetwork } from "../networks/useNetworks"

/** Hook to return the `Account` on the current network associated with the `:accountAddress` parameter in the current route */
export const useRouteAccount = () => {
  const accountAddress = useRouteAccountAddress()
  const currentNetwork = useCurrentNetwork()
  const account = useAccount({
    address: accountAddress || "",
    networkId: currentNetwork.id,
  })
  return account
}
