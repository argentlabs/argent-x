import {
  messageStream,
  sendMessage,
  waitForMessage,
} from "../../shared/messages"

export const getMessagingPublicKey = async () => {
  sendMessage({ type: "GET_MESSAGING_PUBLIC_KEY" })
  return waitForMessage("GET_MESSAGING_PUBLIC_KEY_RES")
}

export const getActions = async () => {
  sendMessage({ type: "GET_ACTIONS" })
  return waitForMessage("GET_ACTIONS_RES")
}

export const removePreAuthorization = async (host: string) => {
  sendMessage({ type: "REMOVE_PREAUTHORIZATION", data: host })
  await waitForMessage("REMOVE_PREAUTHORIZATION_RES")
}

if (process.env.NODE_ENV === "development") {
  messageStream.subscribe(([message]) => {
    console.log("Received message", message)
  })
}
