import { autoConnect } from "trpc-browser/shared/chrome"
import type Emittery from "emittery"

import { getIsSafeMessageSender } from "../../../shared/messages/getIsSafeMessageSender"
import type { DeepPick } from "../../../shared/types/deepPick"
import type { IUIService } from "../../../shared/ui/IUIService"
import type { UIMessage } from "../../../shared/ui/UIMessage"
import {
  Navigate,
  ShowNotification,
  type Events,
  type IClientUIService,
} from "./IClientUIService"
import { messageClient } from "../trpc"

type MinimalBrowser = DeepPick<
  typeof chrome,
  "runtime.connect" | "runtime.onMessage" | "extension.getViews"
>

export default class ClientUIService implements IClientUIService {
  constructor(
    readonly emitter: Emittery<Events>,
    private browser: MinimalBrowser,
    private uiService: IUIService,
  ) {
    this.initMessageListeners()
  }

  initMessageListeners() {
    this.browser.runtime.onMessage.addListener(
      (message: UIMessage, sender, sendResponse) => {
        const isSafeOrigin = getIsSafeMessageSender(sender)
        if (!isSafeOrigin) {
          return
        }
        switch (message.type) {
          case "HAS_POPUP":
            sendResponse(this.hasPopup())
            break
          case "CLOSE_POPUP":
            this.closePopup()
            break
          case "NAVIGATE":
            void this.emitter.emit(Navigate, message.payload)
            break
          case "SHOW_NOTIFICATION":
            void this.emitter.emit(ShowNotification, message.payload)
            break
          default:
            message satisfies never
        }
      },
    )
  }

  registerUIProcess() {
    /** connect to the background port from the UI */
    void autoConnect(
      () => this.browser.runtime.connect({ name: this.uiService.connectId }),
      () => {}, // just ignore the new port, the important part is that the connection got established
    )
  }

  getPopup() {
    const [popup] = this.browser.extension.getViews({ type: "popup" })
    return popup
  }

  hasPopup() {
    const popup = this.getPopup()
    return Boolean(popup)
  }

  closePopup() {
    const popup = this.getPopup()
    if (popup) {
      popup.close()
    }
  }

  async onNotificationClicked(notificationId: string) {
    await messageClient.notifications.notificationClicked.mutate(notificationId)
  }

  async openUiAsPopup(): Promise<void> {
    await messageClient.ui.openUiAsPopup.query()
  }
}
