import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

import { defaultNetwork } from "../../shared/network"
import { networkStatusRepo } from "../../shared/network/statusStore"
import { networkRepo } from "../../shared/network/store"
import { selectedBaseAccountView } from "./account"
import { atomWithDebugLabel } from "./atomWithDebugLabel"
import { atomFromRepo } from "./implementation/atomFromRepo"

export const allNetworksView = atomFromRepo(networkRepo)

const networkStatusesView = atomFromRepo(networkStatusRepo)

const expectedNetworkOrder = [
  "mainnet-alpha",
  "sepolia-alpha",
  "localhost",
  "integration",
]

export const allNetworksWithStatusesView = atom(async (get) => {
  const networks = await get(allNetworksView)

  const networkStatuses = await get(networkStatusesView)
  const unsortedNetworks = networks.map((network) => ({
    ...network,
    status:
      networkStatuses.find((n) => n.id === network.id)?.status ?? "unknown",
  }))

  const sortedNetworks = unsortedNetworks.sort((a, b) => {
    const indexA = expectedNetworkOrder.indexOf(a.id)
    const indexB = expectedNetworkOrder.indexOf(b.id)

    // Handle values not in the order array - i.e custom networks - by giving them a high index
    const sortOrderA = indexA === -1 ? expectedNetworkOrder.length : indexA
    const sortOrderB = indexB === -1 ? expectedNetworkOrder.length : indexB

    return sortOrderA - sortOrderB
  })

  return sortedNetworks
})

export const networkView = atomFamily((networkId?: string) =>
  atomWithDebugLabel(
    atom(async (get) => {
      if (!networkId) {
        return
      }
      const networks = await get(allNetworksView)
      return networks.find((network) => network.id === networkId)
    }),
    `networkView-${networkId}`,
  ),
)

export const networkOrDefaultView = atomFamily((networkId: string) =>
  atomWithDebugLabel(
    atom(async (get) => {
      const network = await get(networkView(networkId))
      return network || defaultNetwork
    }),
    `networkOrDefaultView-${networkId}`,
  ),
)

export const selectedNetworkIdView = atom(async (get) => {
  const selectedBaseAccount = await get(selectedBaseAccountView)
  return selectedBaseAccount?.networkId ?? defaultNetwork.id
})

export const selectedNetworkView = atom(async (get) => {
  const selectedNetworkId = await get(selectedNetworkIdView)
  const selectedNetwork = await get(networkView(selectedNetworkId))
  return selectedNetwork ?? defaultNetwork
})
