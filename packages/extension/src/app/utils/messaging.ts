import type { JWK } from "jose"
import { Transaction } from "starknet"
import browser from "webextension-polyfill"

import { Messenger } from "../../utils/Messenger"

const allowedSender = ["INJECT", "INPAGE", "BACKGROUND"]
const port = browser.runtime.connect({ name: "argent-x-ui" })
export const messenger = new Messenger(
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

export const readRequestedTransactions = async (): Promise<Transaction[]> => {
  messenger.emit("READ_REQUESTED_TRANSACTIONS", {})
  return messenger.waitForEvent("READ_REQUESTED_TRANSACTIONS_RES", 2000)
}

export const readPendingWhitelist = async (): Promise<string[]> => {
  messenger.emit("GET_PENDING_WHITELIST", {})
  return messenger.waitForEvent("GET_PENDING_WHITELIST_RES", 2000)
}

export const getLastSelectedWallet = async (): Promise<string | undefined> => {
  messenger.emit("GET_SELECTED_WALLET_ADDRESS", {})
  return messenger.waitForEvent("GET_SELECTED_WALLET_ADDRESS_RES", 2000)
}

export const getPublicKey = async (): Promise<JWK> => {
  messenger.emit("REQ_PUB", {})
  return messenger.waitForEvent("REQ_PUB_RES", 2000)
}
