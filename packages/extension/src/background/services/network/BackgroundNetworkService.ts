import { uniqWith } from "lodash-es"

import { IHttpService } from "@argent/x-shared"
import urlJoin from "url-join"
import { ARGENT_NETWORK_STATUS } from "../../../shared/api/constants"
import { argentApiNetworkForNetwork } from "../../../shared/api/headers"
import { NetworkError } from "../../../shared/errors/network"
import { ColorStatus, Network } from "../../../shared/network"
import { colorStatusSchema } from "../../../shared/network/schema"
import { INetworkWithStatusRepo } from "../../../shared/network/statusStore"
import { INetworkRepo, networksEqual } from "../../../shared/network/store"
import { IBackgroundNetworkService } from "./IBackgroundNetworkService"

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
            status: "unknown" as ColorStatus,
          }
        }

        const url = urlJoin(ARGENT_NETWORK_STATUS, backendNetworkId)
        try {
          const response = await this.httpService.get<{
            state: string
          }>(url)

          // Validate the response
          return {
            status: colorStatusSchema.parse(response.state),
            id: network.id,
          }
        } catch (error) {
          return {
            id: network.id,
            status: "unknown" as ColorStatus,
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
