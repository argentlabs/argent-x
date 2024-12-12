import { describe, expect, test, vi, type Mocked } from "vitest"

import type { IHttpService } from "@argent/x-shared"
import {
  NativeActivityTypeNative,
  type AnyActivity,
} from "@argent/x-shared/simulation"

import { InMemoryObjectStore } from "../../../../shared/storage/__new/__test__/inmemoryImplementations"
import { ActivityCacheService } from "./ActivityCacheService"

import type {
  IActivityCacheItem,
  IActivityCacheStorage,
} from "../../../../shared/activity/cache/IActivityCacheStorage"
import {
  SignerType,
  type BaseWalletAccount,
} from "../../../../shared/wallet.model"
import type { IBackgroundUIService } from "../../ui/IBackgroundUIService"
import { sortActivities } from "./mergeAndSortActivities"
import { getAccountIdentifier } from "../../../../shared/utils/accountIdentifier"

const networkId = "sepolia-alpha"
const address1 =
  "0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25"

const address2 =
  "0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a26"

const mockSigner = {
  type: SignerType.LOCAL_SECRET,
  derivationPath: "m/44'/60'/0'/0/0",
}

const id1 = getAccountIdentifier(address1, networkId, mockSigner)
const id2 = getAccountIdentifier(address2, networkId, mockSigner)

const account: BaseWalletAccount = {
  id: id1,
  address: address1,
  networkId,
}

const otherAccount: BaseWalletAccount = {
  id: id2,
  address: address2,
  networkId,
}

const activities: AnyActivity[] = [
  {
    type: NativeActivityTypeNative,
    status: "pending",
    submitted: 1,
    lastModified: 1,
    transaction: {
      hash: "0x1",
    },
  },
  {
    type: NativeActivityTypeNative,
    status: "success",
    submitted: 2,
    lastModified: 2,
    transaction: {
      hash: "0x2",
    },
  },
  {
    type: NativeActivityTypeNative,
    status: "success",
    submitted: 3,
    lastModified: 3,
    transaction: {
      hash: "0x3",
    },
  },
]

const otherActivities: AnyActivity[] = [
  {
    type: NativeActivityTypeNative,
    status: "pending",
    submitted: 4,
    lastModified: 4,
    transaction: {
      hash: "0x4",
    },
  },
]

describe("ActivityCacheService", () => {
  const makeService = () => {
    const activityCacheStore = new InMemoryObjectStore<IActivityCacheStorage>({
      namespace: "service:activityCache",
      defaults: {
        cache: {},
      },
    })

    const httpService = {
      get: vi.fn(),
    } as unknown as Mocked<IHttpService>

    const backgroundUIService = {
      emitter: {
        on: vi.fn(),
      },
    } as unknown as IBackgroundUIService

    const activityCacheService = new ActivityCacheService(
      activityCacheStore,
      httpService,
      backgroundUIService,
    )

    return {
      activityCacheStore,
      httpService,
      activityCacheService,
    }
  }
  describe("set and get cached activities", async () => {
    const { activityCacheService } = makeService()

    describe("when the cache is empty", async () => {
      test("returns undefined", async () => {
        expect(
          await activityCacheService.getCachedActivities(account),
        ).toBeUndefined()
        expect(
          await activityCacheService.getCachedActivities(otherAccount),
        ).toBeUndefined()
      })
    })

    describe("when the cache is populated", async () => {
      test("returns cached items for the specific account address and network", async () => {
        await activityCacheService.setCachedActivities({ account, activities })

        expect(await activityCacheService.getCachedActivities(account)).toEqual(
          activities,
        )
        expect(
          await activityCacheService.getCachedActivities(otherAccount),
        ).toBeUndefined()

        await activityCacheService.setCachedActivities({
          account: otherAccount,
          activities: otherActivities,
        })

        expect(await activityCacheService.getCachedActivities(account)).toEqual(
          activities,
        )
        expect(
          await activityCacheService.getCachedActivities(otherAccount),
        ).toEqual(otherActivities)
      })
    })

    describe("when activities are upserted", async () => {
      test("updates the activities as expected", async () => {
        const updatedActivity: AnyActivity = {
          ...activities[0],
          status: "success",
        }
        await activityCacheService.upsertActivities({
          account,
          activities: [updatedActivity],
        })
        const cachedUpdatedActivities =
          await activityCacheService.getCachedActivities(account)
        const cachedUpdatedActivity = cachedUpdatedActivities?.find(
          (activity) =>
            activity.transaction.hash === updatedActivity.transaction.hash,
        )
        expect(cachedUpdatedActivity).toEqual(updatedActivity)
      })
    })
  })

  describe("load more activities", async () => {
    const { httpService, activityCacheService } = makeService()

    describe("when the cache is empty", async () => {
      test("fetches the first page", async () => {
        const pageState: IActivityCacheItem["pageState"] = {
          page: 0,
          pageSize: activities.length,
          totalElements: activities.length + otherActivities.length,
          totalPages: 2,
        }
        httpService.get.mockResolvedValueOnce({
          activities,
          ...pageState,
        })
        await activityCacheService.loadMore(account)
        expect(httpService.get).toHaveBeenCalledWith(
          expect.stringMatching(
            /0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25\/activities\?page=0$/,
          ),
        )
        const cacheItem =
          await activityCacheService.getActivityCacheItem(account)
        expect(cacheItem?.activities).toEqual(sortActivities(activities))
        expect(cacheItem?.pageState).toEqual(pageState)
      })
    })

    describe("when there are more pages", async () => {
      test("fetches next page", async () => {
        const pageState: IActivityCacheItem["pageState"] = {
          page: 1,
          pageSize: activities.length,
          totalElements: activities.length + otherActivities.length,
          totalPages: 2,
        }
        httpService.get.mockClear()
        httpService.get.mockResolvedValueOnce({
          activities: otherActivities,
          ...pageState,
        })
        await activityCacheService.loadMore(account)
        expect(httpService.get).toHaveBeenCalledWith(
          expect.stringMatching(
            /0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25\/activities\?page=1$/,
          ),
        )
        const cacheItem =
          await activityCacheService.getActivityCacheItem(account)
        expect(cacheItem?.activities).toEqual(
          sortActivities([...activities, ...otherActivities]),
        )
        expect(cacheItem?.pageState).toEqual(pageState)
      })
    })

    describe("when it's the last page", async () => {
      test("does not fetch", async () => {
        httpService.get.mockClear()
        await activityCacheService.loadMore(account)
        expect(httpService.get).not.toHaveBeenCalled()
      })
    })
  })
})
