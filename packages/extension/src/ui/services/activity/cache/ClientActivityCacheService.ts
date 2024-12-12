import type { messageClient } from "../../trpc"
import type { IActivityCacheService } from "../../../../shared/activity/cache/IActivityCacheService"
import type { BaseWalletAccount } from "../../../../shared/wallet.model"

export class ClientActivityCacheService
  implements Pick<IActivityCacheService, "loadMore">
{
  constructor(private readonly trpcClient: typeof messageClient) {}

  async loadMore(account?: BaseWalletAccount) {
    if (!account) {
      return
    }
    const { id, address, networkId } = account
    return this.trpcClient.activityCache.loadMore.mutate({
      id,
      address,
      networkId,
    })
  }
}
