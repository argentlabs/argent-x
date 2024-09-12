import { useView } from "../../../views/implementation/react"
import {
  allNetworksWithStatusesView,
  selectedNetworkIdView,
} from "../../../views/network"
import { useNetwork } from "./useNetwork"

export const useCurrentNetwork = () => {
  const selectedNetworkId = useView(selectedNetworkIdView)

  return useNetwork(selectedNetworkId)
}

export const useCurrentNetworkWithStatus = () => {
  const selectedNetworkId = useView(selectedNetworkIdView)
  const networksStatuses = useView(allNetworksWithStatusesView)

  const network = useNetwork(selectedNetworkId)
  const networkWithStatus = networksStatuses.find(
    (n) => n.id === selectedNetworkId,
  )
  return {
    ...network,
    status: networkWithStatus?.status,
  }
}
