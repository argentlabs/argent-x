import browser from "webextension-polyfill"

import type { MiscenalleousMessage as MiscellaneousMessage } from "../shared/messages/MiscellaneousMessage"
import { resetDevice } from "../shared/smartAccount/jwt"
import { sendMessageToUi } from "./activeTabs"
import { UnhandledMessage } from "./background"
import type { HandleMessage } from "./background"
import { backgroundUIService } from "./services/ui"

export const handleMiscellaneousMessage: HandleMessage<
  MiscellaneousMessage
> = async ({ msg, messagingKeys: { publicKeyJwk }, respond }) => {
  switch (msg.type) {
    case "OPEN_UI": {
      return backgroundUIService.openUi()
    }

    case "RESET_ALL": {
      try {
        await browser.storage.local.clear()
        await browser.storage.sync.clear()
        await browser.storage.managed.clear()
        await browser.storage.session.clear()
      } catch {
        // Ignore browser.storage.session error "This is a read-only store"
      }
      await resetDevice()
      return respond({ type: "DISCONNECT_ACCOUNT" })
    }

    case "GET_MESSAGING_PUBLIC_KEY": {
      return sendMessageToUi({
        type: "GET_MESSAGING_PUBLIC_KEY_RES",
        data: publicKeyJwk,
      })
    }
  }

  throw new UnhandledMessage()
}
