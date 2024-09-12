import { useView } from "../../../views/implementation/react"
import {
  allNetworksView,
  allNetworksWithStatusesView,
} from "../../../views/network"

export const useNetworks = () => {
  const networks = useView(allNetworksView)
  return networks
}

const expectedNetworkOrder = [
  "mainnet-alpha",
  "sepolia-alpha",
  "localhost",
  "integration",
]

export const useNetworksWithStatuses = () => {
  const networks = useView(allNetworksWithStatusesView)
  const sortedNetworks = networks.sort((a, b) => {
    const indexA = expectedNetworkOrder.indexOf(a.id)
    const indexB = expectedNetworkOrder.indexOf(b.id)

    // Handle values not in the order array - i.e custom networks - by giving them a high index
    const sortOrderA = indexA === -1 ? expectedNetworkOrder.length : indexA
    const sortOrderB = indexB === -1 ? expectedNetworkOrder.length : indexB

    return sortOrderA - sortOrderB
  })
  return sortedNetworks
}
