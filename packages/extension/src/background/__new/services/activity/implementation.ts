import { HTTPService, IHttpService } from "@argent/shared"

import { Activity, ActivityResponse } from "./model"
import { IActivityService } from "./interface"
import { IActivity, IActivityStorage } from "../../../../shared/activity/types"
import { argentApiNetworkForNetwork } from "../../../../shared/api/fetcher"
import { ActivityError } from "../../../../shared/errors/activity"
import { KeyValueStorage } from "../../../../shared/storage"

export class ActivityService implements IActivityService {
  private readonly httpService: IHttpService

  constructor(
    protected readonly apiBase: string,
    private readonly activityStore: KeyValueStorage<IActivityStorage>,
    private readonly headers: HeadersInit | undefined,
  ) {
    this.httpService = new HTTPService({ headers: this.headers }, "json")
  }

  async fetchActivities({
    address,
    networkId,
    lastModified,
  }: {
    address: string
    networkId: string
    lastModified?: number
  }) {
    const endpoint = `${this.apiBase}/${argentApiNetworkForNetwork(
      networkId,
    )}/account/${address}/activities${
      lastModified ? `?modifiedAfter=${lastModified}` : ""
    }`

    const response = await this.httpService.get<ActivityResponse>(endpoint)
    if (!response) {
      throw new ActivityError({ code: "FETCH_FAILED" })
    }
    return response.activities
    // TODO uncomment this once we have the final API
    // const parsedActivities = activityResponseSchema.safeParse(response)

    // if (!parsedActivities.success) {
    //   throw new ActivityError({
    //     code: "PARSING_FAILED",
    //   })
    // }
    // return parsedActivities.data.activities
  }

  findLatestBalanceChangingTransaction(
    activities: Activity[],
  ): Activity | null {
    if (!activities || activities.length === 0) {
      return null
    }

    // All balance changing transactions have transfers
    const balanceChangingActivities = activities.filter(
      (activity) => activity.transfers && activity.transfers.length > 0,
    )

    if (balanceChangingActivities.length === 0) {
      return null
    }

    const [latestBalanceChangingTransaction] = balanceChangingActivities.sort(
      (a, b) => {
        // Check if any of the transactions are pending
        const aIsPending = a.transaction.status === "pending"
        const bIsPending = b.transaction.status === "pending"

        // Prioritize pending transactions
        if (aIsPending && !bIsPending) {
          return -1
        } else if (!aIsPending && bIsPending) {
          return 1
        } else if (aIsPending && bIsPending) {
          // If both are pending, sort by transactionIndex
          return b.transaction.transactionIndex - a.transaction.transactionIndex
        } else {
          // If neither is pending, sort by blockNumber then transactionIndex
          if (
            a.transaction.blockNumber &&
            b.transaction.blockNumber &&
            a.transaction.blockNumber !== b.transaction.blockNumber
          ) {
            return b.transaction.blockNumber - a.transaction.blockNumber
          } else {
            return (
              b.transaction.transactionIndex - a.transaction.transactionIndex
            )
          }
        }
      },
    )
    return latestBalanceChangingTransaction
  }

  async shouldUpdateBalance({
    address,
    networkId,
  }: {
    address: string
    networkId: string
  }) {
    const latestBalanceChangingActivity = (
      await this.activityStore.get("latestBalanceChangingActivity")
    )?.[address]
    const activities = await this.fetchActivities({
      address,
      networkId,
      lastModified: latestBalanceChangingActivity?.lastModified,
    })
    const latestActivity = this.findLatestBalanceChangingTransaction(activities)
    const shouldUpdate =
      !latestBalanceChangingActivity?.id ||
      latestActivity?.id !== latestBalanceChangingActivity?.id

    if (shouldUpdate && latestActivity) {
      return {
        shouldUpdate,
        lastModified: latestActivity.lastModified,
        id: latestActivity.id,
      }
    }
    return { shouldUpdate: false }
  }

  async addActivityToStore({
    address,
    lastModified,
    id,
  }: IActivity & {
    address: string
  }) {
    await this.activityStore.set("latestBalanceChangingActivity", {
      [address]: {
        id: id,
        lastModified: lastModified,
      },
    })
  }
}
