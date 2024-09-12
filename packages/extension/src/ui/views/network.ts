import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

import { defaultNetwork } from "../../shared/network"
import { networkRepo } from "../../shared/network/store"
import { atomFromRepo } from "./implementation/atomFromRepo"
import { networkStatusRepo } from "../../shared/network/statusStore"
import { selectedBaseAccountView } from "./account"
import { useView } from "./implementation/react"

export const allNetworksView = atomFromRepo(networkRepo)
const networkStatusesView = atomFromRepo(networkStatusRepo)

export const allNetworksWithStatusesView = atom(async (get) => {
  const networks = await get(allNetworksView)

  const networkStatuses = await get(networkStatusesView)
  return networks.map((network) => ({
    ...network,
    status:
      networkStatuses.find((n) => n.id === network.id)?.status ?? "unknown",
  }))
})

export const networkView = atomFamily((networkId?: string) =>
  atom(async (get) => {
    if (!networkId) {
      return
    }
    const networks = await get(allNetworksView)
    return networks.find((network) => network.id === networkId)
  }),
)

export const networkOrDefaultView = atomFamily((networkId: string) =>
  atom(async (get) => {
    const network = await get(networkView(networkId))
    return network || defaultNetwork
  }),
)

export const selectedNetworkIdView = atom(async (get) => {
  const selectedBaseAccount = await get(selectedBaseAccountView)
  return selectedBaseAccount?.networkId ?? defaultNetwork.id
})

export const selectedNetworkView = atom(async (get) => {
  const selectedNetworkId = useView(selectedNetworkIdView)
  const selectedNetwork = await get(networkView(selectedNetworkId))
  return selectedNetwork ?? defaultNetwork
})
