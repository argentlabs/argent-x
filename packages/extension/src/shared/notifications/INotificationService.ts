import type { NotificationDeepLink } from "./schema"
import type { BaseWalletAccount } from "../wallet.model"

export type OptionsStatus = "pending" | "success" | "failure"

export type Options = {
  title: string
  status?: OptionsStatus
}

export interface INotificationService {
  /** show the notification with the given id, unless it has already been shown */
  show(notificationId: string, options: Options): void

  /** show the notification with the given deep link, unless it has already been shown */
  showWithDeepLink(
    notificationDeepLink: NotificationDeepLink,
    options: Options,
  ): void

  /** check if a notification with the given id has already been shown in the current session */
  hasShown(notificationId: string): boolean

  /** clears the notification */
  clear(notificationId: string): void

  /** makes a stable id for given transaction hash and account */
  makeId({
    hash,
    account,
  }: {
    hash: string
    account: BaseWalletAccount
  }): string

  onNotificationClicked(notificationId: string): Promise<void>
}
