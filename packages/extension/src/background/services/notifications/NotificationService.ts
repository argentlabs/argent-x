import { getAccountIdentifier, normalizeAddress } from "@argent/x-shared"
import type { WalletAccountSharedService } from "../../../shared/account/service/accountSharedService/WalletAccountSharedService"
import type {
  INotificationService,
  Options,
  OptionsStatus,
} from "../../../shared/notifications/INotificationService"
import {
  notificationDeepLinkSchema,
  type NotificationDeepLink,
} from "../../../shared/notifications/schema"
import type { DeepPick } from "../../../shared/types/deepPick"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import type { IBackgroundUIService } from "../ui/IBackgroundUIService"
import { MinimalIWalletSessionService } from "../ui/BackgroundUIService"

export type MinimalBrowser = DeepPick<
  typeof chrome,
  | "notifications.create"
  | "notifications.getAll"
  | "notifications.clear"
  | "notifications.onClicked"
>

const MAX_SHOWN_NOTIFICATION_IDS = 100

const iconUrlByStatus: Record<OptionsStatus, string> = {
  pending: "./assets/notification-success-icon@3x.png",
  success: "./assets/notification-success-icon@3x.png",
  failure: "./assets/notification-failure-icon@3x.png",
}

export class NotificationService implements INotificationService {
  /** track in memory what notifications are shown */
  private shownNotificationIds: Array<string> = []

  constructor(
    private browser: MinimalBrowser,
    private backgroundUIService: IBackgroundUIService,
    private accountSharedService: WalletAccountSharedService,
    private sessionService: MinimalIWalletSessionService,
  ) {
    this.browser.notifications.onClicked.addListener(
      (notificationId) => void this.onNotificationClicked(notificationId),
    )
  }

  show(notificationId: string, options: Options) {
    if (this.hasShown(notificationId)) {
      return
    }
    // Store no more than MAX_SHOWN_NOTIFICATION_IDS by removing the oldest

    if (this.shownNotificationIds.length === MAX_SHOWN_NOTIFICATION_IDS) {
      this.shownNotificationIds.shift()
    }

    this.shownNotificationIds.push(notificationId)
    const { title, status } = options
    const iconUrl = status ? iconUrlByStatus[status] : undefined
    if (this.backgroundUIService.opened && !this.sessionService.locked) {
      void this.backgroundUIService.showNotification({
        notificationId,
        iconUrl,
        title,
      })
    } else {
      this.browser.notifications.create(notificationId, {
        type: "basic",
        iconUrl:
          iconUrl ||
          "./assets/appicon.png" /** Fall back to show with app icon at system level */,
        eventTime: Date.now(),
        title,
        message: "",
      })
    }
  }

  showWithDeepLink(
    notificationDeepLink: NotificationDeepLink,
    options: Options,
  ) {
    const notificationDeepLinkParsed =
      notificationDeepLinkSchema.parse(notificationDeepLink)
    const notificationId = JSON.stringify(notificationDeepLinkParsed)
    return this.show(notificationId, options)
  }

  clear(notificationId: string) {
    this.browser.notifications.clear(notificationId)
  }

  hasShown(notificationId: string) {
    const hasShowNotification = this.shownNotificationIds.some((key) => {
      if (key === notificationId) {
        return true
      }
      try {
        const notificationDeepLink = JSON.parse(key)
        return notificationDeepLink?.id === notificationId
      } catch {
        // ignore parse error
      }
      return false
    })
    return hasShowNotification
  }

  async onNotificationClicked(notificationId: string) {
    this.browser.notifications.clear(notificationId)
    const index = this.shownNotificationIds.indexOf(notificationId)
    if (index > -1) {
      this.shownNotificationIds.splice(index, 1)
    }
    try {
      const notificationDeepLink = JSON.parse(notificationId)
      const notificationDeepLinkParsed =
        notificationDeepLinkSchema.parse(notificationDeepLink)
      await this.accountSharedService.selectAccount(
        notificationDeepLinkParsed.account,
      )
      await this.backgroundUIService.openUi(notificationDeepLinkParsed.route)
    } catch {
      // ignore parse error
    }
  }

  makeId({ hash, account }: { hash: string; account: BaseWalletAccount }) {
    return [normalizeAddress(hash), getAccountIdentifier(account)]
      .filter(Boolean)
      .join(":")
  }
}
