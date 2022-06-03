import {
  messageStream,
  sendMessage,
  waitForMessage,
} from "../../shared/messages"
import { encryptForBackground } from "./crypto"

if (process.env.NODE_ENV === "development") {
  messageStream.subscribe(([message]) => {
    console.log("Received message", message)
  })
}

export const getActions = async () => {
  sendMessage({ type: "GET_ACTIONS" })
  return waitForMessage("GET_ACTIONS_RES")
}

export const getMessagingPublicKey = async () => {
  sendMessage({ type: "GET_MESSAGING_PUBLIC_KEY" })
  return waitForMessage("GET_MESSAGING_PUBLIC_KEY_RES")
}

export const isInitialized = async () => {
  sendMessage({ type: "IS_INITIALIZED" })
  return await waitForMessage("IS_INITIALIZED_RES")
}

export const hasActiveSession = async () => {
  sendMessage({ type: "HAS_SESSION" })
  return waitForMessage("HAS_SESSION_RES")
}

export const startSession = async (password: string): Promise<void> => {
  const body = await encryptForBackground(password)

  sendMessage({ type: "START_SESSION", data: { secure: true, body } })

  const succeeded = await Promise.race([
    waitForMessage("START_SESSION_RES").then(() => true),
    waitForMessage("START_SESSION_REJ")
      .then(() => false)
      .catch(() => false),
  ])

  if (!succeeded) {
    throw Error("Wrong password")
  }
}

export const checkPassword = async (password: string): Promise<boolean> => {
  const body = await encryptForBackground(password)

  sendMessage({ type: "CHECK_PASSWORD", data: { body } })

  return await Promise.race([
    waitForMessage("CHECK_PASSWORD_RES").then(() => true),
    waitForMessage("CHECK_PASSWORD_REJ")
      .then(() => false)
      .catch(() => false),
  ])
}

export const removePreAuthorization = async (host: string) => {
  sendMessage({
    type: "REMOVE_PREAUTHORIZATION",
    data: host,
  })
  await waitForMessage("REMOVE_PREAUTHORIZATION_RES")
}
