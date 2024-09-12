/**
 * Window types used in this service
 * - 'popup' refers to the normal extension window opened by user clicking extension icon
 */

import type {
  UINavigatePayload,
  UIShowNotificationPayload,
} from "../../../shared/ui/UIMessage"

export interface IClientUIService {
  /** register a running ui process */
  registerUIProcess(): void

  /**
   * Get popup
   * @returns popup if it exists
   */
  getPopup(): Window | undefined

  /**
   * Determine if there is an existing popup
   * @returns true if it exists
   */
  hasPopup(): boolean

  /**
   * Close popup if it exists
   */
  closePopup(): void

  onNotificationClicked(notificationId: string): Promise<void>
}

export const Navigate = Symbol("Navigate")
export const ShowNotification = Symbol("ShowNotification")

export type Events = {
  [Navigate]: UINavigatePayload
  [ShowNotification]: UIShowNotificationPayload
}
