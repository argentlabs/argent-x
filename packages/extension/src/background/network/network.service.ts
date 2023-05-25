import { uniqWith } from "lodash-es"

import { Network, defaultNetworks } from "../../shared/network"
import { allNetworksStore, equalNetwork } from "../../shared/network/storage"
import { getNetworkStatuses } from "./networkStatus.worker"

export interface NetworkService {
  updateStatuses: () => Promise<void>
  loadNetworks: () => Promise<Network[]>
}

export const networkService: NetworkService = {
  async loadNetworks() {
    const allNetworks = uniqWith(
      [...(await allNetworksStore.get()), ...defaultNetworks],
      equalNetwork,
    )
    return allNetworks
  },
  async updateStatuses() {
    const networks = await this.loadNetworks()
    const networkStatuses = await getNetworkStatuses(networks)
    const networkWithUpdatedStatuses = networks.map((network) => {
      return {
        ...network,
        status: networkStatuses[network.id] ?? "unknown",
      }
    })
    await allNetworksStore.push(networkWithUpdatedStatuses)
  },
}
