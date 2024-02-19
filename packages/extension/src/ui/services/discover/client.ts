import { IDiscoverService } from "../../../shared/discover/interface"
import { messageClient } from "../messaging/trpc"

export class DiscoverService implements IDiscoverService {
  constructor(private trpcMessageClient: typeof messageClient) {}

  async setViewedAt(viewedAt: number): Promise<void> {
    return this.trpcMessageClient.discover.viewedAt.mutate(viewedAt)
  }
}
