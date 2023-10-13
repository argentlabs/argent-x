import { SelectorFn } from "../../storage/__new/interface"
import { networkSelector, networkSelectorByChainId } from "../selectors"
import { INetworkRepo } from "../store"
import { Network } from "../type"
import type { INetworkService } from "./interface"
import { defaultNetworks } from "../defaults"
import { getDefaultNetwork } from "../utils"

export class NetworkService implements INetworkService {
  constructor(private readonly networkRepo: INetworkRepo) {}

  async get(selector?: SelectorFn<Network>): Promise<Network[]> {
    const allNetworks = await this.networkRepo.get()
    if (selector) {
      return allNetworks.filter(selector)
    }
    return allNetworks
  }

  async getById(networkId: string): Promise<Network> {
    const [network] = await this.get(networkSelector(networkId))
    if (!network) {
      return getDefaultNetwork(defaultNetworks)
    }
    return network
  }

  async getByChainId(chainId: string): Promise<Network> {
    const [network] = await this.get(networkSelectorByChainId(chainId))
    return network
  }

  async add(network: Network) {
    await this.networkRepo.upsert(network)
  }

  async removeById(networkId: string) {
    await this.networkRepo.remove(networkSelector(networkId))
  }

  async restoreDefaults() {
    await this.networkRepo.remove(() => true)
    await this.networkRepo.upsert(defaultNetworks)
  }
}
