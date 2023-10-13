import { IUdcService } from "../../../shared/udc/service/interface"
import { messageClient } from "../messaging/trpc"

export class UdcService implements IUdcService {
  constructor(private trpcMessageClient: typeof messageClient) {}

  async getConstructorParams(networkId: string, classHash: string) {
    return await this.trpcMessageClient.udc.getConstructorParams.query({
      networkId,
      classHash,
    })
  }
}
