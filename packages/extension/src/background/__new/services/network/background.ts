import { uniqWith } from "lodash-es"

import { Network, NetworkStatus } from "../../../../shared/network"
import { INetworkRepo, networksEqual } from "../../../../shared/network/store"
import { IBackgroundNetworkService } from "./interface"
import { INetworkWithStatusRepo } from "../../../../shared/network/statusStore"
import { IHttpService } from "@argent/shared"
import urlJoin from "url-join"
import { argentApiNetworkForNetwork } from "../../../../shared/api/headers"
import { ARGENT_NETWORK_STATUS } from "../../../../shared/api/constants"
import { NetworkError } from "../../../../shared/errors/network"

export default class BackgroundNetworkService
  implements IBackgroundNetworkService
{
  constructor(
    private readonly networkRepo: INetworkRepo,
    private readonly networkWithStatusRepo: INetworkWithStatusRepo,
    readonly defaultNetworks: Network[],
    private readonly httpService: IHttpService,
  ) {}

  private async loadNetworks() {
    const allNetworks = uniqWith(
      [...(await this.networkRepo.get()), ...this.defaultNetworks],
      networksEqual,
    )
    return allNetworks
  }

  async getNetworkStatuses(networks: Network[]) {
    return Promise.all(
      networks.map(async (network) => {
        if (ARGENT_NETWORK_STATUS === undefined) {
          throw new NetworkError({ code: "ARGENT_NETWORK_STATUS_NOT_DEFINED" })
        }
        const backendNetworkId = argentApiNetworkForNetwork(network.id)

        if (!backendNetworkId) {
          return {
            id: network.id,
            status: "unknown" as NetworkStatus,
          }
        }

        const url = urlJoin(ARGENT_NETWORK_STATUS, backendNetworkId)
        try {
          const response = await this.httpService.get<{
            state: NetworkStatus
          }>(url)

          return {
            status: response.state,
            id: network.id,
          }
        } catch (error) {
          return {
            id: network.id,
            status: "unknown" as NetworkStatus,
          }
        }
      }),
    )
  }
  async updateStatuses() {
    const networks = await this.loadNetworks()

    const networkStatuses = await this.getNetworkStatuses(networks)

    const networkWithUpdatedStatuses = networks.map((network) => {
      return {
        id: network.id,
        status:
          networkStatuses.find(
            (networkStatus) => networkStatus.id === network.id,
          )?.status ?? "unknown",
      }
    })

    await this.networkWithStatusRepo.upsert(networkWithUpdatedStatuses)
  }
}
