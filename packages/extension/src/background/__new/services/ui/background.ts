import Emittery from "emittery"
import browser from "webextension-polyfill"

import { IUIService } from "../../../../shared/__new/services/ui/interface"
import { DeepPick } from "../../../../shared/types/deepPick"
import { openUi } from "../../../openUi"
import { Locked } from "../../../wallet/session/interface"
import type { WalletSessionService } from "../../../wallet/session/session.service"
import type { Events, IBackgroundUIService } from "./interface"
import { Opened } from "./interface"

type MinimalBrowser = DeepPick<
  typeof chrome,
  "runtime.connect" | "runtime.onConnect.addListener"
>

type MinimalIUIService = Pick<IUIService, "connectId" | "hasTab">

type MinimalPort = DeepPick<
  browser.runtime.Port,
  "name" | "onDisconnect.addListener"
>

type MinimalIWalletSessionService = Pick<
  WalletSessionService,
  "emitter" | "locked"
>

export default class BackgroundUIService implements IBackgroundUIService {
  private _opened = false
  private isInitialising = true

  constructor(
    readonly emitter: Emittery<Events>,
    private browser: MinimalBrowser,
    private uiService: MinimalIUIService,
    private sessionService: MinimalIWalletSessionService,
  ) {
    this.initListeners()
    void (async () => {
      /** initialise opened state */
      const hasTab = await this.uiService.hasTab()
      this.opened = hasTab
    })()
  }

  /*
   * There is no usable 'close' event on an extension
   *
   * instead we open a message port to the extension and simply listen for it to be disconnected
   * as a side-effect of the extension being closed
   */

  private initListeners() {
    this.browser.runtime.onConnect.addListener(this.onConnectPort.bind(this))
  }

  /** listen for the port connection from the UI, then detect disconnection */
  onConnectPort(port: MinimalPort) {
    if (port.name !== this.uiService.connectId) {
      return
    }
    this.opened = true
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    port.onDisconnect.addListener(this.onDisconnectPort.bind(this))
  }

  async onDisconnectPort() {
    /** An instance of the UI was closed */
    const hasTab = await this.uiService.hasTab()
    if (!hasTab) {
      /** There are no more instances left open */
      this.opened = false
    }
  }

  get opened() {
    return this._opened
  }

  private set opened(opened: boolean) {
    if (this.isInitialising) {
      /** don't emit on initial value change */
      this.isInitialising = false
      this._opened = opened
      return
    }
    if (this._opened === opened) {
      return
    }
    this._opened = opened
    void this.emitter.emit(Opened, this.opened)
  }

  async openUiAndUnlock() {
    if (!this.opened) {
      await openUi()
      /** wait for Opened state to update */
      await this.emitter.once(Opened)
    }
    if (!this.sessionService.locked) {
      return true
    }
    /** wait for change in either Locked or Opened state */
    await Promise.race([
      this.emitter.once(Opened),
      this.sessionService.emitter.once(Locked),
    ])
    const unlocked = !this.sessionService.locked
    return unlocked
  }
}
