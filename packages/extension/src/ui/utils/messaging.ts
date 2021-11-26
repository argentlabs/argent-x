import { CompactEncrypt, JWK, importJWK } from "jose"
import { encode } from "starknet"
import browser from "webextension-polyfill"

import type { ActionItem } from "../../background/actionQueue"
import { MessageType } from "../../shared/MessageType"
import { Messenger } from "../../shared/Messenger"

const allowedSender = ["INJECT", "INPAGE", "BACKGROUND"]
const port = browser.runtime.connect({ name: "argent-x-ui" })
export const messenger = new Messenger<MessageType>(
  (emit) => {
    port.onMessage.addListener(function (msg) {
      console.log(msg)
      if (msg.from && msg.type && allowedSender.includes(msg.from)) {
        const { type, data } = msg
        emit(type, data)
      }
    })
  },
  (type, data) => {
    console.log({ from: "UI", type, data })
    port.postMessage({ from: "UI", type, data })
  },
)

export const readLatestActionAndCount = async (): Promise<{
  action: ActionItem | null
  count: number
}> => {
  messenger.emit("GET_LATEST_ACTION_AND_COUNT", undefined)
  return messenger.waitForEvent("GET_LATEST_ACTION_AND_COUNT_RES", 2000)
}

export const getLastSelectedWallet = async (): Promise<string | undefined> => {
  messenger.emit("GET_SELECTED_WALLET_ADDRESS", undefined)
  return messenger.waitForEvent("GET_SELECTED_WALLET_ADDRESS_RES", 2000)
}

export const getPublicKey = async (): Promise<JWK> => {
  messenger.emit("REQ_PUB", undefined)
  return messenger.waitForEvent("REQ_PUB_RES", 2000)
}

export const isInitialized = async (): Promise<boolean> => {
  messenger.emit("IS_INITIALIZED", undefined)
  return messenger.waitForEvent("IS_INITIALIZED_RES", 2000)
}

export const hasActiveSession = async (): Promise<boolean> => {
  messenger.emit("HAS_SESSION", undefined)
  return messenger.waitForEvent("HAS_SESSION_RES", 2000)
}

export const getWallets = async (): Promise<string[]> => {
  messenger.emit("GET_WALLETS", undefined)
  return messenger.waitForEvent("GET_WALLETS_RES", 2000)
}

export const startSession = async (password: string): Promise<void> => {
  const pubJwk = await getPublicKey()
  const pubKey = await importJWK(pubJwk)

  const encMsg = await new CompactEncrypt(encode.utf8ToArray(password))
    .setProtectedHeader({ alg: "ECDH-ES", enc: "A256GCM" })
    .encrypt(pubKey)

  messenger.emit("START_SESSION", { secure: true, body: encMsg })

  const succeeded = await Promise.race([
    messenger.waitForEvent("START_SESSION_RES", 3000).then(() => true),
    messenger
      .waitForEvent("START_SESSION_REJ", 2000)
      .then(() => false)
      .catch(() => false),
  ])

  if (!succeeded) throw Error("Wrong password")
}

export const monitorProgress = (updateFn: (progress: number) => void) => {
  const handler = <K extends keyof MessageType>(
    type: K,
    data: MessageType[K],
  ) => {
    if (type === "REPORT_PROGRESS") {
      updateFn(data as MessageType["REPORT_PROGRESS"])
      if (data === 1) {
        messenger.unlisten(handler)
      }
    }
  }
  messenger.listen(handler)
}
