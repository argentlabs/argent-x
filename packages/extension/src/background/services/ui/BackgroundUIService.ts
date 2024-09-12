import Emittery from "emittery"
import browser from "webextension-polyfill"

import { urlWithQuery } from "@argent/x-shared"
import type { KeyValueStorage } from "../../../shared/storage"
import type { DeepPick } from "../../../shared/types/deepPick"
import type { IUIService } from "../../../shared/ui/IUIService"
import type {
  UIMessage,
  UIShowNotificationPayload,
} from "../../../shared/ui/UIMessage"
import type { WalletStorageProps } from "../../../shared/wallet/walletStore"
import { Locked } from "../../wallet/session/interface"
import type { WalletSessionService } from "../../wallet/session/WalletSessionService"
import type { Events, IBackgroundUIService } from "./IBackgroundUIService"
import { Opened } from "./IBackgroundUIService"

const NOTIFICATION_WIDTH = 360
const NOTIFICATION_HEIGHT = 600 + 28 // +28 for the title bar

type MinimalBrowser = DeepPick<
  typeof chrome,
  | "runtime.connect"
  | "runtime.getURL"
  | "runtime.onConnect.addListener"
  | "windows.getLastFocused"
  | "windows.create"
>

type MinimalIUIService = Pick<
  IUIService,
  | "connectId"
  | "hasTab"
  | "focusTab"
  | "hasFloatingWindow"
  | "focusFloatingWindow"
>

type MinimalPort = DeepPick<
  browser.runtime.Port,
  "name" | "onDisconnect.addListener"
>

export type MinimalIWalletSessionService = Pick<
  WalletSessionService,
  "emitter" | "locked"
>

export default class BackgroundUIService implements IBackgroundUIService {
  private _opened = false
  private isInitialising = true
  private openUiPending = false

  constructor(
    readonly emitter: Emittery<Events>,
    private browser: MinimalBrowser,
    private uiService: MinimalIUIService,
    private sessionService: MinimalIWalletSessionService,
    private walletStore: KeyValueStorage<WalletStorageProps>,
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
      await this.openUi()
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

  /**
   * background cannot access popup in v3 manifest, must use messaging <-> ClientUIService
   */

  async hasPopup() {
    try {
      return await this.sendMessageToClientUIService<boolean>({
        type: "HAS_POPUP",
      })
    } catch (e) {
      // ignore error - no ui is open
      return false
    }
  }

  async closePopup() {
    try {
      await this.sendMessageToClientUIService({ type: "CLOSE_POPUP" })
    } catch (e) {
      // ignore error - no ui is open
    }
  }

  async sendMessageToClientUIService<T>(msg: UIMessage): Promise<T> {
    return browser.runtime.sendMessage(msg)
  }

  async openUi(initialRoute?: string) {
    if (this.openUiPending) {
      return
    }
    this.openUiPending = true
    try {
      await this.openUiInternal(initialRoute)
    } finally {
      this.openUiPending = false
    }
  }

  /** TODO: refactor - can't use OnboardingService because it depends on this Service… */
  async getOnboardingComplete() {
    const value = await this.walletStore.get("backup")
    return Boolean(value)
  }

  private async openUiInternal(maybeInitialRoute?: string) {
    let initialRoute: string | undefined

    /** don't allow deep linking unless onboarded */
    if (maybeInitialRoute) {
      const onboardingComplete = await this.getOnboardingComplete()
      if (onboardingComplete) {
        initialRoute = maybeInitialRoute
      }
    }

    if (this.opened) {
      if (await this.uiService.hasTab()) {
        await this.uiService.focusTab()
      }
      if (await this.uiService.hasFloatingWindow()) {
        await this.uiService.focusFloatingWindow()
      }
      if (initialRoute) {
        await this.sendMessageToClientUIService({
          type: "NAVIGATE",
          payload: {
            path: initialRoute,
          },
        })
      }
      return
    }

    let left = 0
    let top = 0
    try {
      const lastFocused = await this.browser.windows.getLastFocused()

      // Position window in top right corner of lastFocused window.
      top = lastFocused.top ?? 0
      left =
        (lastFocused.left ?? 0) +
        Math.max((lastFocused.width ?? 0) - NOTIFICATION_WIDTH, 0)
    } catch (_) {
      // The following properties are more than likely 0, due to being
      // opened from the background chrome process for the extension that
      // has no physical dimensions
      const { screenX, screenY, outerWidth } = window
      top = Math.max(screenY, 0)
      left = Math.max(screenX + (outerWidth - NOTIFICATION_WIDTH), 0)
    }

    const url = urlWithQuery("index.html", initialRoute ? { initialRoute } : {})

    await this.browser.windows.create({
      url,
      type: "popup",
      width: NOTIFICATION_WIDTH,
      height: NOTIFICATION_HEIGHT,
      left,
      top,
    })
  }

  async showNotification(payload: UIShowNotificationPayload) {
    await this.sendMessageToClientUIService({
      type: "SHOW_NOTIFICATION",
      payload,
    })
  }
}
