import type { Address } from "@argent/x-shared"
import type { IOnRampService } from "../../../shared/onRamp/IOnRampService"
import type { messageClient } from "../trpc"

export class ClientOnRampService implements IOnRampService {
  constructor(private readonly trpcClient: typeof messageClient) {}

  async getTopperUrl(address: Address) {
    return await this.trpcClient.onramp.getTopperUrl.query(address)
  }
}
