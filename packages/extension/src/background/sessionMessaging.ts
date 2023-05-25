import { compactDecrypt } from "jose"

import { SessionMessage } from "../shared/messages/SessionMessage"
import { bytesToUft8 } from "../shared/utils/encode"
import { sendMessageToUi } from "./activeTabs"
import { UnhandledMessage } from "./background"
import { HandleMessage } from "./background"

export const handleSessionMessage: HandleMessage<SessionMessage> = async ({
  msg,
  background: { wallet },
  messagingKeys: { privateKey },
  respond,
}) => {
  switch (msg.type) {
    case "START_SESSION": {
      const { secure, body } = msg.data
      if (secure !== true) {
        throw Error("session can only be started with encryption")
      }
      const { plaintext } = await compactDecrypt(body, privateKey)
      const sessionPassword = bytesToUft8(plaintext)
      const result = await wallet.startSession(sessionPassword, (percent) => {
        respond({ type: "LOADING_PROGRESS", data: percent })
      })
      if (result) {
        const selectedAccount = await wallet.getSelectedAccount()
        return respond({
          type: "START_SESSION_RES",
          data: selectedAccount,
        })
      }
      return respond({ type: "START_SESSION_REJ" })
    }

    case "CHECK_PASSWORD": {
      const { body } = msg.data
      const { plaintext } = await compactDecrypt(body, privateKey)
      const password = bytesToUft8(plaintext)
      if (await wallet.checkPassword(password)) {
        return sendMessageToUi({ type: "CHECK_PASSWORD_RES" })
      }
      return sendMessageToUi({ type: "CHECK_PASSWORD_REJ" })
    }

    case "HAS_SESSION": {
      return respond({
        type: "HAS_SESSION_RES",
        data: await wallet.isSessionOpen(),
      })
    }

    case "STOP_SESSION": {
      await wallet.lock()
      return respond({ type: "DISCONNECT_ACCOUNT" })
    }

    case "IS_INITIALIZED": {
      const initialized = await wallet.isInitialized()
      return respond({
        type: "IS_INITIALIZED_RES",
        data: { initialized },
      })
    }
  }

  throw new UnhandledMessage()
}
