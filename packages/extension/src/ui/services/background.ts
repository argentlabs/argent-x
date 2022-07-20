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

export const resetAll = () => {
  sendMessage({ type: "RESET_ALL" })
}

export const removePreAuthorization = async (host: string) => {
  sendMessage({ type: "REMOVE_PREAUTHORIZATION", data: host })
  await waitForMessage("REMOVE_PREAUTHORIZATION_RES")
}

export const resetPreAuthorizatinos = () => {
  sendMessage({ type: "RESET_PREAUTHORIZATIONS" })
}

if (IS_DEV) {
  messageStream.subscribe(([message]) => {
    console.log("Received message", message)
  })
  require("../features/dev/hotReload")
}
