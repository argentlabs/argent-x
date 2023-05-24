import browser from "webextension-polyfill"

import { MiscenalleousMessage as MiscellaneousMessage } from "../shared/messages/MiscellaneousMessage"
import { resetDevice } from "../shared/shield/jwt"
import { sendMessageToUi } from "./activeTabs"
import { UnhandledMessage } from "./background"
import { HandleMessage } from "./background"
import { openUi } from "./openUi"

export const handleMiscellaneousMessage: HandleMessage<
  MiscellaneousMessage
> = async ({ msg, messagingKeys: { publicKeyJwk }, respond }) => {
  switch (msg.type) {
    case "OPEN_UI": {
      return openUi()
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
