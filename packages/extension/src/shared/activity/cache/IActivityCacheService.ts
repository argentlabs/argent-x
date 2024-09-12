import type { AnyActivity } from "@argent/x-shared/simulation"

import type { BaseWalletAccount } from "../../wallet.model"
import type { IActivityCacheItem } from "./IActivityCacheStorage"

export interface IActivityCacheService {
  getActivityCacheItem(
    account: BaseWalletAccount,
  ): Promise<IActivityCacheItem | undefined>
  setActivityCacheItem(args: {
    activityCacheItem: IActivityCacheItem
    account: BaseWalletAccount
  }): Promise<void>
  getCachedActivities(
    account: BaseWalletAccount,
  ): Promise<AnyActivity[] | undefined>
  setCachedActivities(args: {
    account: BaseWalletAccount
    activities: AnyActivity[]
  }): Promise<void>
  loadMore(account?: BaseWalletAccount): Promise<void>
  upsertActivities(args: {
    account?: BaseWalletAccount
    activities: AnyActivity[]
  }): Promise<void>
}
