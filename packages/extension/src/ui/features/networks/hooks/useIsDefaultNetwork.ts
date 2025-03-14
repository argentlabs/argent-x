import { defaultNetwork } from "../../../../shared/network"
import { useView } from "../../../views/implementation/react"
import { selectedNetworkIdView } from "../../../views/network"

// if no networkId is provided, selectedNetworkIdView will use the networkId from the selected account
// networkId should be provided when there can be no accounts
export const useIsDefaultNetwork = (providedNetworkId?: string) => {
  const selectedNetworkId = useView(selectedNetworkIdView)
  const networkId = providedNetworkId ?? selectedNetworkId
  return networkId === defaultNetwork.id
}
