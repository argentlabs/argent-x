import type { IDiscoverService } from "../../../shared/discover/IDiscoverService"
import type { messageClient } from "../trpc"

export class ClientDiscoverService implements IDiscoverService {
  constructor(private trpcMessageClient: typeof messageClient) {}

  async setViewedAt(viewedAt: number): Promise<void> {
    return this.trpcMessageClient.discover.viewedAt.mutate(viewedAt)
  }
}
