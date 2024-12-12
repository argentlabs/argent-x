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
import type { IAccountService } from "../../../../shared/account/service/accountService/IAccountService"
import type { TransactionTrackerWorker } from "../../transactionTracker/worker/TransactionTrackerWorker"
import { TransactionStatusChanged } from "../../transactionTracker/worker/TransactionTrackerWorker"
import {
  isRejectOnChainActivity,
  type Activity,
} from "@argent/x-shared/simulation"
import type { IActivityCacheService } from "../../../../shared/activity/cache/IActivityCacheService"
import { argentDb } from "../../../../shared/idb/argentDb"
import { equalToken } from "../../../../shared/token/__new/utils"
import { delay } from "../../../../shared/utils/delay"

// We poll activities instantly after a transaction status change, then we try 2*500ms and 3*1s intervals
const DELAYS = [...Array(2).fill(500), ...Array(3).fill(1000)]

export class ActivityWorker {
  constructor(
    private readonly activityService: IActivityService,
    private readonly accountService: IAccountService,
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
    if (isRejectOnChainActivity(activity)) {
      return "On-chain reject"
    }

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
    const account = await this.makeAccountFromActivity(activity)

    if (!account) {
      return
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

  private async getActivitiesForTransactions(transactions: string[]) {
    const activities =
      await this.activityService.updateSelectedAccountActivities()
    return ensureArray(activities).filter((activity) =>
      transactions.some((transaction) =>
        isEqualAddress(activity.transaction.hash, transaction),
      ),
    )
  }

  private async pollForActivities(transactions: string[]) {
    for (const delayMs of DELAYS) {
      await delay(delayMs)
      const newActivities =
        await this.getActivitiesForTransactions(transactions)
      if (newActivities.length > 0) {
        return newActivities
      }
    }
    return []
  }

  async onTransactionStatusChanged({
    transactions,
  }: {
    transactions: string[]
  }) {
    let newActivities = await this.getActivitiesForTransactions(transactions)

    if (newActivities.length === 0) {
      newActivities = await this.pollForActivities(transactions)
    }

    await Promise.all(
      newActivities.map((activity) => this.sendActivityNotification(activity)),
    )
  }

  private async makeAccountFromActivity(activity: Activity) {
    if (!activity.networkDetails) {
      return
    }

    const network = starknetNetworkToNetworkId(
      activity.networkDetails.ethereumNetwork,
    )

    const accounts = await this.accountService.get()

    // TODO: Find a better way to get the account
    const maybeAccount = accounts.find(
      (account) =>
        isEqualAddress(account.address, activity.wallet) &&
        account.networkId === network,
    )

    if (!maybeAccount) {
      console.error("Account not found")
      return
    }

    return {
      id: maybeAccount.id,
      address: maybeAccount.address,
      networkId: maybeAccount.networkId,
    }
  }
}
