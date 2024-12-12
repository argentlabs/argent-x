/**
 * Window types used in this service
 * - 'popup' refers to the normal extension window opened by user clicking extension icon
 */

import type Emittery from "emittery"
import type { UIShowNotificationPayload } from "../../../shared/ui/UIMessage"

export const Opened = Symbol("Opened")

export type Events = {
  /**
   * Fired when UI state changes to/from having any open windows or tabs
   */
  [Opened]: boolean
}

export interface IBackgroundUIService {
  readonly emitter: Emittery<Events>
  /**
   * Flag for if there are one or more UI windows or tabs open currently
   */
  readonly opened: boolean

  /**
   * Opens ui
   * returns true if already unlocked, or if the user proceeded to unlock the wallet
   * returns false if the wallet was locked and the user closed the wallet
   */
  openUiAndUnlock(): Promise<boolean>

  /**
   * Opens ui and navigates to the initialRoute
   */
  openUi(initialRoute?: string): Promise<void>

  /**
   * Opens ui as a floating window, regardles of whether it's already opened in a tab
   */
  openUiAsFloatingWindow(): Promise<void>

  /**
   * Determine if there is an existing popup
   * @returns true if it exists
   */
  hasPopup(): Promise<boolean>

  /**
   * Close popup if it exists
   */
  closePopup(): Promise<void>

  /**
   * Show in-app notificaiton in the UI
   */
  showNotification(payload: UIShowNotificationPayload): Promise<void>
}
