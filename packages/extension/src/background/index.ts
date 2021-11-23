import { compactDecrypt } from "jose"
import { encode } from "starknet"
import browser from "webextension-polyfill"

import { MessageType } from "../shared/MessageType"
import { Messenger } from "../shared/Messenger"
import { ActionItem, getQueue } from "./actionQueue"
import { getKeyPair } from "./key"
import { openUi } from "./openUi"
import { Storage, getFromStorage, setToStorage } from "./storage"
import { addToWhitelist, isOnWhitelist, removeFromWhitelist } from "./whitelist"

const allowedSender = ["INJECT", "UI", "INPAGE"]

browser.runtime.onConnect.addListener(async function (port) {
  if (port.name !== "argent-x-content") return
  browser.runtime.onConnect.addListener(function (uiPort) {
    if (uiPort.name !== "argent-x-ui") return
    const uiToContentForwarder = async (data: any) => {
      port.postMessage(data)
    }
    const contentToUiForwarder = async (data: any) => {
      uiPort.postMessage(data)
    }

    uiPort.onMessage.addListener(uiToContentForwarder)
    port.onMessage.addListener(contentToUiForwarder)
    uiPort.onDisconnect.addListener(() => {
      port.onMessage.removeListener(uiToContentForwarder)
    })
    port.onDisconnect.addListener(() => {
      uiPort.onMessage.removeListener(contentToUiForwarder)
    })
  })

  const { privateKey, publicKeyJwk } = await getKeyPair()

  const messenger = new Messenger<MessageType>(
    (emit) => {
      port.onMessage.addListener((data) => {
        if (data.from && data.type && allowedSender.includes(data.from)) {
          const { type, data: evData } = data
          emit(type, evData)
        }
      })
    },
    (type, data) => {
      port.postMessage({ from: "BACKGROUND", type, data })
    },
  )

  const actionQueue = await getQueue<ActionItem>("ACTIONS")

  const store = new Storage<{
    SELECTED_WALLET: string
  }>({
    SELECTED_WALLET: "",
  })

  messenger.listen(async (type, data) => {
    switch (type) {
      case "OPEN_UI": {
        return openUi()
      }

      case "ADD_TRANSACTION": {
        return await actionQueue.push({
          type: "TRANSACTION",
          payload: data as MessageType["ADD_TRANSACTION"],
        })
      }

      case "GET_LATEST_ACTION_AND_COUNT": {
        const action = await actionQueue.getLatest()
        const count = await actionQueue.length()
        return messenger.emit("GET_LATEST_ACTION_AND_COUNT_RES", {
          action,
          count,
        })
      }

      case "GET_SELECTED_WALLET_ADDRESS": {
        const selectedWallet = await store.getItem("SELECTED_WALLET")

        return messenger.emit(
          "GET_SELECTED_WALLET_ADDRESS_RES",
          selectedWallet || "",
        )
      }

      case "CONNECT": {
        const selectedWallet = await store.getItem("SELECTED_WALLET")
        const isWhitelisted = await isOnWhitelist(
          (data as MessageType["CONNECT"]).host,
        )

        if (!isWhitelisted) {
          actionQueue.push({
            type: "CONNECT",
            payload: { host: (data as MessageType["CONNECT"]).host },
          })
        }

        if (isWhitelisted && selectedWallet)
          return messenger.emit("CONNECT_RES", selectedWallet)

        return openUi()
      }

      case "WALLET_CONNECTED": {
        return store.setItem(
          "SELECTED_WALLET",
          data as MessageType["WALLET_CONNECTED"],
        )
      }

      case "SUBMITTED_TX":
      case "FAILED_TX": {
        return await actionQueue.removeLatest()
      }

      case "RESET_ALL": {
        return browser.storage.local.clear()
      }

      case "ADD_WHITELIST": {
        return actionQueue.push({
          type: "CONNECT",
          payload: { host: data as MessageType["ADD_WHITELIST"] },
        })
      }
      case "APPROVE_WHITELIST": {
        const selectedWallet = await store.getItem("SELECTED_WALLET")
        await actionQueue.removeLatest()
        await addToWhitelist(data as MessageType["APPROVE_WHITELIST"])
        if (selectedWallet) return messenger.emit("CONNECT_RES", selectedWallet)
        return openUi()
      }
      case "REJECT_WHITELIST": {
        return actionQueue.removeLatest()
      }
      case "REMOVE_WHITELIST": {
        return removeFromWhitelist(data as MessageType["REMOVE_WHITELIST"])
      }
      case "IS_WHITELIST": {
        const valid = await isOnWhitelist(data as MessageType["IS_WHITELIST"])
        return messenger.emit("IS_WHITELIST_RES", valid)
      }
      case "RESET_WHITELIST": {
        setToStorage(`WHITELIST:APPROVED`, [])
        setToStorage(`WHITELIST:PENDING`, [])
        return
      }
      case "REQ_PUB": {
        return messenger.emit("REQ_PUB_RES", publicKeyJwk)
      }
      case "START_SESSION": {
        const { enc, body } = data as MessageType["START_SESSION"]
        if (enc !== true)
          throw Error("session can only be started with encryption")
        const { plaintext } = await compactDecrypt(body, privateKey)
        console.log(encode.arrayBufferToString(plaintext))
      }
    }
  })
})
