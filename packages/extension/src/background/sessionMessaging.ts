import { compactDecrypt } from "jose"
import { encode } from "starknet"

import { SessionMessage } from "../shared/messages/SessionMessage"
import { UnhandledMessage } from "./background"
import { HandleMessage } from "./background"

export const handleSessionMessage: HandleMessage<SessionMessage> = async ({
  msg,
  background: { wallet },
  messagingKeys: { privateKey },
  sendToTabAndUi,
}) => {
  switch (msg.type) {
    case "START_SESSION": {
      const { secure, body } = msg.data
      if (secure !== true) {
        throw Error("session can only be started with encryption")
      }
      const { plaintext } = await compactDecrypt(body, privateKey)
      const sessionPassword = encode.arrayBufferToString(plaintext)
      const result = await wallet.startSession(sessionPassword, (percent) => {
        sendToTabAndUi({ type: "LOADING_PROGRESS", data: percent })
      })
      if (result) {
        const selectedAccount = await wallet.getSelectedAccount()
        return sendToTabAndUi({
          type: "START_SESSION_RES",
          data: selectedAccount,
        })
      }
      return sendToTabAndUi({ type: "START_SESSION_REJ" })
    }

    case "CHECK_PASSWORD": {
      const { body } = msg.data
      const { plaintext } = await compactDecrypt(body, privateKey)
      const password = encode.arrayBufferToString(plaintext)
      if (wallet.checkPassword(password)) {
        return sendToTabAndUi({ type: "CHECK_PASSWORD_RES" })
      }
      return sendToTabAndUi({ type: "CHECK_PASSWORD_REJ" })
    }

    case "HAS_SESSION": {
      return sendToTabAndUi({
        type: "HAS_SESSION_RES",
        data: wallet.isSessionOpen(),
      })
    }

    case "STOP_SESSION": {
      wallet.lock()
      return sendToTabAndUi({ type: "DISCONNECT_ACCOUNT" })
    }

    case "IS_INITIALIZED": {
      const initialized = wallet.isInitialized()
      return sendToTabAndUi({
        type: "IS_INITIALIZED_RES",
        data: { initialized },
      })
    }
  }

  throw new UnhandledMessage()
}
