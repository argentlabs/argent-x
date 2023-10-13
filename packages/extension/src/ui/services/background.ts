import {
  messageStream,
  sendMessage,
  waitForMessage,
} from "../../shared/messages"
import { IS_DEV } from "../../shared/utils/dev"

export const getMessagingPublicKey = async () => {
  sendMessage({ type: "GET_MESSAGING_PUBLIC_KEY" })
  return waitForMessage("GET_MESSAGING_PUBLIC_KEY_RES")
}

if (IS_DEV) {
  messageStream.subscribe(([message]) => {
    console.log("Received message", message)
  })
  require("../features/dev/hotReload")
}
