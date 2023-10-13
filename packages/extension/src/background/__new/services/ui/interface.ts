import Emittery from "emittery"

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
}
