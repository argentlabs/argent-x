import {
  ensureArray,
  ensureDecimals,
  isEqualAddress,
  prettifyTokenAmount,
} from "@argent/x-shared"

import type {
  INotificationService,
  Options,
} from "../../../../shared/notifications/INotificationService"
import { routes } from "../../../../shared/ui/routes"
import { starknetNetworkToNetworkId } from "../../../../shared/utils/starknetNetwork"
import type { BaseWalletAccount } from "../../../../shared/wallet.model"
import type { IActivityService } from "../IActivityService"
import {
  TransactionStatusChanged,
  TransactionTrackerWorker,
} from "../../transactionTracker/worker/TransactionTrackerWorker"
import { Activity } from "@argent/x-shared/simulation"
import { IActivityCacheService } from "../../../../shared/activity/cache/IActivityCacheService"
import { argentDb } from "../../../../shared/idb/db"
import { equalToken } from "../../../../shared/token/__new/utils"

export class ActivityWorker {
  constructor(
    private readonly activityService: IActivityService,
    private readonly notificationService: INotificationService,
    private readonly activityCacheService: IActivityCacheService,
    private readonly transactionTrackerWorker: TransactionTrackerWorker,
  ) {
    this.transactionTrackerWorker.emitter.on(
      TransactionStatusChanged,
      (payload) => void this.onTransactionStatusChanged(payload),
    )
  }

  private async handleSendReceiveNotifications(
    activity: Activity,
    account: BaseWalletAccount,
  ) {
    const title = activity.title || ""

    if (activity.details.type !== "payment") {
      return title
    }

    if (title !== "Send" && title !== "Receive") {
      return title
    }

    const asset = activity.details.asset

    const tokenAddress = asset.tokenAddress
    const allTokens = await argentDb.tokens.toArray()
    const token = allTokens.find((token) =>
      equalToken(token, {
        address: tokenAddress,
        networkId: account.networkId,
      }),
    )

    if (!token) {
      return title
    }

    const amount = asset.amount || 0

    const displayAmount = prettifyTokenAmount({
      amount,
      decimals: ensureDecimals(token.decimals),
      symbol: token.symbol,
    })

    return `${title} ${displayAmount}`
  }

  private async sendActivityNotification(activity: Activity) {
    if (!activity.networkDetails) {
      return
    }
    const account: BaseWalletAccount = {
      address: activity.wallet,
      networkId: starknetNetworkToNetworkId(
        activity.networkDetails.ethereumNetwork,
      ),
    }
    const hash = activity.transaction.hash
    const id = this.notificationService.makeId({ hash, account })
    if (this.notificationService.hasShown(id)) {
      return
    }

    const title = `Transaction ${activity.status !== "success" ? "rejected" : "succeeded"}`

    const options: Options = {
      title,
      status: activity.status,
    }

    if (activity.title) {
      options.title = await this.handleSendReceiveNotifications(
        activity,
        account,
      )
    } else {
      // Else extract title from cached activity (tx review)
      const cachedActivities =
        await this.activityCacheService.getCachedActivities(account)
      const cachedActivity = cachedActivities?.find((cachedActivity) =>
        isEqualAddress(cachedActivity.transaction.hash, hash),
      )

      if (cachedActivity && "meta" in cachedActivity) {
        if (cachedActivity.meta?.title) {
          options.title = cachedActivity.meta.title
        }
      }
    }

    void this.notificationService.showWithDeepLink(
      {
        id,
        account,
        route: routes.transactionDetail(hash, routes.accountActivity()),
      },
      options,
    )
  }

  async onTransactionStatusChanged({
    transactions,
  }: {
    transactions: string[]
  }) {
    const activities =
      await this.activityService.updateSelectedAccountActivities()
    const newActivities = ensureArray(activities).filter((activity) =>
      transactions.some((transaction) =>
        isEqualAddress(activity.transaction.hash, transaction),
      ),
    )

    await Promise.all(
      newActivities.map((activity) => this.sendActivityNotification(activity)),
    )
  }
}
