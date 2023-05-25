import { messageClient } from "../../../ui/services/messaging/trpc"
import { Network } from "../type"
import type { INetworkService } from "./interface"

export class NetworkService implements INetworkService {
  constructor(private readonly trpcClient: typeof messageClient) {}

  async add(network: Network): Promise<boolean> {
    return this.trpcClient.network.add.mutate(network)
  }
}
