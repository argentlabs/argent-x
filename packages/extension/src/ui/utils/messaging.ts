import type { JWK } from "jose"
import browser from "webextension-polyfill"

import type { ActionItem } from "../../background/actionQueue"
import { MessageType } from "../../shared/MessageType"
import { Messenger } from "../../shared/Messenger"

const allowedSender = ["INJECT", "INPAGE", "BACKGROUND"]
const port = browser.runtime.connect({ name: "argent-x-ui" })
export const messenger = new Messenger<MessageType>(
  (emit) => {
    port.onMessage.addListener(function (msg) {
      if (msg.from && msg.type && allowedSender.includes(msg.from)) {
        const { type, data } = msg
        emit(type, data)
      }
    })
  },
  (type, data) => {
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
