import { messageClient } from "../../trpc"
import { IActivityCacheService } from "../../../../shared/activity/cache/IActivityCacheService"
import { BaseWalletAccount } from "../../../../shared/wallet.model"

export class ClientActivityCacheService
  implements Pick<IActivityCacheService, "loadMore">
{
  constructor(private readonly trpcClient: typeof messageClient) {}

  async loadMore(account?: BaseWalletAccount) {
    if (!account) {
      return
    }
    const { address, networkId } = account
    return this.trpcClient.activityCache.loadMore.mutate({ address, networkId })
  }
}
