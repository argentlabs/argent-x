import { useAppState } from "../../../app.state"
import { useView } from "../../../views/implementation/react"
import { allNetworksWithStatusesView } from "../../../views/network"
import { useNetwork } from "./useNetwork"

export const useCurrentNetwork = () => {
  const { switcherNetworkId } = useAppState()

  return useNetwork(switcherNetworkId)
}

export const useCurrentNetworkWithStatus = () => {
  const { switcherNetworkId } = useAppState()
  const networksStatuses = useView(allNetworksWithStatusesView)

  const network = useNetwork(switcherNetworkId)
  const networkWithStatus = networksStatuses.find(
    (n) => n.id === switcherNetworkId,
  )
  return {
    ...network,
    status: networkWithStatus?.status ?? "unknown",
  }
}
