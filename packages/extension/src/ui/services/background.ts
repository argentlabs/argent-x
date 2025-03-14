import {
  messageStream,
  sendMessage,
  waitForMessage,
} from "../../shared/messages/messages"
import { IS_DEV } from "../../shared/utils/dev"

export const getMessagingPublicKey = async () => {
  void sendMessage({ type: "GET_MESSAGING_PUBLIC_KEY" })
  return waitForMessage("GET_MESSAGING_PUBLIC_KEY_RES")
}

if (IS_DEV) {
  messageStream.subscribe(([message]) => {
    console.log("Received message", message)
  })
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("../features/dev/hotReload")
}
