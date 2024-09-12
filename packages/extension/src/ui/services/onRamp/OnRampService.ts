import { Address } from "@argent/x-shared"
import { IOnRampService } from "../../../shared/onRamp/IOnRampService"
import { messageClient } from "../trpc"

export class ClientOnRampService implements IOnRampService {
  constructor(private readonly trpcClient: typeof messageClient) {}

  async getTopperUrl(address: Address) {
    return await this.trpcClient.onramp.getTopperUrl.query(address)
  }
}
