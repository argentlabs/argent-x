import {
  messageStream,
  sendMessage,
  waitForMessage,
} from "../../shared/messages"

export const getMessagingPublicKey = async () => {
  sendMessage({ type: "GET_MESSAGING_PUBLIC_KEY" })
  return waitForMessage("GET_MESSAGING_PUBLIC_KEY_RES")
}

export const resetAll = () => {
  sendMessage({ type: "RESET_ALL" })
}

if (process.env.NODE_ENV === "development") {
  messageStream.subscribe(([message]) => {
    console.log("Received message", message)
  })
}
