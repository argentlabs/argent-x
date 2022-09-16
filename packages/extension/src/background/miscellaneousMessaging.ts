import browser from "webextension-polyfill"

import { MiscenalleousMessage as MiscellaneousMessage } from "../shared/messages/MiscellaneousMessage"
import { sendMessageToUi } from "./activeTabs"
import { UnhandledMessage } from "./background"
import { HandleMessage } from "./background"
import { openUi } from "./openUi"

export const handleMiscellaneousMessage: HandleMessage<
  MiscellaneousMessage
> = async ({ msg, messagingKeys: { publicKeyJwk }, sendToTabAndUi }) => {
  switch (msg.type) {
    case "OPEN_UI": {
      return openUi()
    }

    case "RESET_ALL": {
      try {
        browser.storage.local.clear()
        browser.storage.sync.clear()
        browser.storage.managed.clear()
        browser.storage.session.clear()
      } catch {
        // Ignore browser.storage.session error "This is a read-only store"
      }
      return sendToTabAndUi({ type: "DISCONNECT_ACCOUNT" })
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
