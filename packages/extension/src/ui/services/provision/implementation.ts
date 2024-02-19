import { IProvisionService } from "../../../shared/provision/interface"
import { messageClient } from "../messaging/trpc"

export class ProvisionService implements IProvisionService {
  constructor(private trpcMessageClient: typeof messageClient) {}

  async getStatus() {
    return await this.trpcMessageClient.provision.getStatus.query()
  }
}
