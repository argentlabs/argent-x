import { uniqWith } from "lodash-es"

import { Network } from "../../../../shared/network"
import { INetworkRepo, networksEqual } from "../../../../shared/network/store"
import { GetNetworkStatusesFn, IBackgroundNetworkService } from "./interface"
import { INetworkWithStatusRepo } from "../../../../shared/network/statusStore"

export default class BackgroundNetworkService
  implements IBackgroundNetworkService
{
  constructor(
    private readonly networkRepo: INetworkRepo,
    private readonly networkWithStatusRepo: INetworkWithStatusRepo,
    readonly defaultNetworks: Network[],
    private readonly getNetworkStatuses: GetNetworkStatusesFn,
  ) {}

  private async loadNetworks() {
    const allNetworks = uniqWith(
      [...(await this.networkRepo.get()), ...this.defaultNetworks],
      networksEqual,
    )
    return allNetworks
  }

  async updateStatuses() {
    const networks = await this.loadNetworks()
    const networkStatuses = await this.getNetworkStatuses(networks)
    const networkWithUpdatedStatuses = networks.map((network) => {
      return {
        id: network.id,
        status: networkStatuses[network.id] ?? "unknown",
      }
    })

    await this.networkWithStatusRepo.upsert(networkWithUpdatedStatuses)
  }
}
