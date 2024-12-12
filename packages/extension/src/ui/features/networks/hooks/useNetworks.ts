import { useView } from "../../../views/implementation/react"
import {
  allNetworksView,
  allNetworksWithStatusesView,
} from "../../../views/network"

export const useNetworks = () => {
  const networks = useView(allNetworksView)
  return networks
}

export const useNetworksWithStatuses = () => {
  const networks = useView(allNetworksWithStatusesView)
  return networks
}
