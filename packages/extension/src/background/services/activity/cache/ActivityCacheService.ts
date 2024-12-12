import { stripAddressZeroPadding, type IHttpService } from "@argent/x-shared"
import {
  type Activity,
  type ActivityResponse,
  type AnyActivity,
  type NativeActivity,
} from "@argent/x-shared/simulation"
import { isEmpty } from "lodash-es"

import type { IActivityCacheService } from "../../../../shared/activity/cache/IActivityCacheService"
import type {
  IActivityCacheItem,
  IActivityCacheStorage,
} from "../../../../shared/activity/cache/IActivityCacheStorage"
import { ARGENT_API_BASE_URL } from "../../../../shared/api/constants"
import { argentApiNetworkForNetwork } from "../../../../shared/api/headers"
import { ActivityError } from "../../../../shared/errors/activity"
import type { IObjectStore } from "../../../../shared/storage/__new/interface"
import { urlWithQuery } from "../../../../shared/utils/url"
import type { BaseWalletAccount } from "../../../../shared/wallet.model"
import type { IBackgroundUIService } from "../../ui/IBackgroundUIService"
import { onClose } from "../../worker/schedule/decorators"
import { pipe } from "../../worker/schedule/pipe"
import { mergeAndSortActivities } from "./mergeAndSortActivities"

export class ActivityCacheService implements IActivityCacheService {
  constructor(
    private readonly activityCacheStore: IObjectStore<IActivityCacheStorage>,
    private readonly httpService: IHttpService,
    private readonly backgroundUIService: IBackgroundUIService,
  ) {}

  onClose = pipe(onClose(this.backgroundUIService))(async () => {
    void this.cleanupStaleActivities()
  })

  async getActivityCacheItem(
    account: BaseWalletAccount,
  ): Promise<IActivityCacheItem | undefined> {
    const { cache } = await this.activityCacheStore.get()
    return cache[account.id]
  }

  async setActivityCacheItem({
    activityCacheItem,
    account,
  }: {
    activityCacheItem: IActivityCacheItem
    account: BaseWalletAccount
  }): Promise<void> {
    const { cache } = await this.activityCacheStore.get()
    await this.activityCacheStore.set({
      cache: {
        ...cache,
        [account.id]: activityCacheItem,
      },
    })
  }

  async getCachedActivities(
    account: BaseWalletAccount,
  ): Promise<Array<Activity | NativeActivity> | undefined> {
    const activityCacheItem = await this.getActivityCacheItem(account)
    return activityCacheItem?.activities
  }

  async setCachedActivities({
    account,
    activities,
  }: {
    account: BaseWalletAccount
    activities: AnyActivity[]
  }) {
    const activityCacheItem = await this.getActivityCacheItem(account)
    await this.setActivityCacheItem({
      account,
      activityCacheItem: {
        updatedAt: Date.now(),
        ...activityCacheItem,
        activities,
      },
    })
  }

  async loadMore(account?: BaseWalletAccount) {
    const apiBaseUrl = ARGENT_API_BASE_URL
    if (!account || !apiBaseUrl) {
      return
    }
    const argentApiNetwork = argentApiNetworkForNetwork(account.networkId)
    if (!argentApiNetwork) {
      return
    }
    const activityCacheItem = await this.getActivityCacheItem(account)
    if (
      activityCacheItem?.pageState &&
      activityCacheItem.pageState.page >=
        activityCacheItem.pageState.totalPages - 1
    ) {
      return
    }
    const nextPage = activityCacheItem?.pageState
      ? activityCacheItem.pageState.page + 1
      : 0
    /** TODO: refactor - this fetch could move into the ActivityService */
    const url = urlWithQuery(
      [
        apiBaseUrl,
        "activity",
        "starknet",
        argentApiNetwork,
        "account",
        stripAddressZeroPadding(account.address),
        "activities",
      ],
      {
        /** omitting modifiedAfter - is the same as `modifiedAfter=0` but slightly faster */
        page: nextPage,
      },
    )
    const response = await this.httpService.get<ActivityResponse>(url)
    if (!response) {
      throw new ActivityError({ code: "FETCH_FAILED" })
    }

    const { activities, page, pageSize, totalElements, totalPages } = response

    const mergedActivities = mergeAndSortActivities(
      activityCacheItem?.activities,
      activities,
    )

    const pageState = { page, pageSize, totalElements, totalPages }

    /** since this was backend fetch, also update cache page state and time */
    await this.setActivityCacheItem({
      account,
      activityCacheItem: {
        activities: mergedActivities,
        pageState,
        updatedAt: Date.now(),
      },
    })
  }

  async upsertActivities({
    account,
    activities,
  }: {
    account?: BaseWalletAccount
    activities: AnyActivity[]
  }) {
    if (!account) {
      return
    }
    const cachedActivities = await this.getCachedActivities(account)
    const mergedActivities = mergeAndSortActivities(
      cachedActivities,
      activities,
    )
    /** not a back-end fetch so don't update page state */
    await this.setCachedActivities({
      account,
      activities: mergedActivities,
    })
  }

  async cleanupStaleActivities() {
    const now = Date.now()
    const { cache } = await this.activityCacheStore.get()
    const filteredCache: IActivityCacheStorage["cache"] = {}
    Object.entries(cache).forEach(([accountIdentifier, activityCacheItem]) => {
      const filteredActivities = activityCacheItem.activities.filter(
        (activity, index) => {
          /** older than 1 hour */
          const isStale = now - activity.lastModified > 3600 * 1000
          /** will be seen without scrolling */
          const isVisibleOnScreen = index < 10
          /** activity with status "success" can be retreived from backend */
          const isSuccessful = activity.status === "success"
          return !isStale && (isVisibleOnScreen || !isSuccessful)
        },
      )
      /** set sparse state - pagination will be restored when user interacts again */
      if (!isEmpty(filteredActivities)) {
        filteredCache[accountIdentifier] = {
          activities: filteredActivities,
        }
      }
    })
    await this.activityCacheStore.set({
      cache: filteredCache,
    })
  }
}
