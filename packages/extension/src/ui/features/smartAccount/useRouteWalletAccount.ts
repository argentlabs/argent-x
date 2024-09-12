import { useRouteAccountAddress } from "../../hooks/useRoute"
import { useView } from "../../views/implementation/react"
import { selectedNetworkIdView } from "../../views/network"
import { useWalletAccount } from "../accounts/accounts.state"

/** Hook to return the `WalletAccount` on the current network associated with the `:accountAddress` parameter in the current route */
export const useRouteWalletAccount = () => {
  const accountAddress = useRouteAccountAddress()
  const selectedNetworkId = useView(selectedNetworkIdView)
  const account = useWalletAccount({
    address: accountAddress || "",
    networkId: selectedNetworkId,
  })
  return account
}
