import { CompactEncrypt, importJWK } from "jose"
import { encode } from "starknet"

import {
  messageStream,
  sendMessage,
  waitForMessage,
} from "../../shared/messages"

if (process.env.NODE_ENV === "development") {
  messageStream.subscribe(([message]) => {
    console.log("Received message", message)
  })
}

export const readLatestActionAndCount = async () => {
  sendMessage({ type: "GET_LATEST_ACTION_AND_COUNT" })
  return waitForMessage("GET_LATEST_ACTION_AND_COUNT_RES")
}

export const getLastSelectedWallet = async () => {
  sendMessage({ type: "GET_SELECTED_WALLET" })
  return waitForMessage("GET_SELECTED_WALLET_RES")
}

export const getPublicKey = async () => {
  sendMessage({ type: "REQ_PUB" })
  return waitForMessage("REQ_PUB_RES")
}

export const uploadKeystore = async (keystore: string) => {
  sendMessage({
    type: "RECOVER_KEYSTORE",
    data: keystore,
  })
  return waitForMessage("RECOVER_KEYSTORE_RES")
}

export const isInitialized = async () => {
  sendMessage({ type: "IS_INITIALIZED" })
  return await waitForMessage("IS_INITIALIZED_RES")
}

export const hasActiveSession = async () => {
  sendMessage({ type: "HAS_SESSION" })
  return waitForMessage("HAS_SESSION_RES")
}

export const getWallets = async () => {
  sendMessage({ type: "GET_WALLETS" })
  return waitForMessage("GET_WALLETS_RES")
}

export const startSession = async (password: string): Promise<void> => {
  const pubJwk = await getPublicKey()
  const pubKey = await importJWK(pubJwk)

  const encMsg = await new CompactEncrypt(encode.utf8ToArray(password))
    .setProtectedHeader({ alg: "ECDH-ES", enc: "A256GCM" })
    .encrypt(pubKey)

  sendMessage({ type: "START_SESSION", data: { secure: true, body: encMsg } })

  const succeeded = await Promise.race([
    waitForMessage("START_SESSION_RES").then(() => true),
    waitForMessage("START_SESSION_REJ")
      .then(() => false)
      .catch(() => false),
  ])

  if (!succeeded) throw Error("Wrong password")
}

export const monitorProgress = (updateFn: (progress: number) => void) => {
  messageStream.subscribe(([msg]) => {
    if (msg.type === "REPORT_PROGRESS") {
      updateFn(msg.data)
    }
  })
}
