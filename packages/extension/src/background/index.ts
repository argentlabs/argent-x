import { compactDecrypt } from "jose"
import { ec, encode } from "starknet"
import browser from "webextension-polyfill"

import { MessageType } from "../shared/MessageType"
import { Messenger } from "../shared/Messenger"
import { ActionItem, getQueue } from "./actionQueue"
import { getKeyPair } from "./keys/communication"
import {
  createAccount,
  existsL1,
  getL1,
  getWallets,
  validatePassword,
} from "./keys/l1"
import { openUi } from "./openUi"
import {
  getSession,
  hasActiveSession,
  startSession,
  stopSession,
} from "./session"
import { Storage, setToStorage } from "./storage"
import { addToWhitelist, isOnWhitelist, removeFromWhitelist } from "./whitelist"

const allowedSender = ["INJECT", "UI", "INPAGE"]

async function main() {
  const { privateKey, publicKeyJwk } = await getKeyPair()

  const actionQueue = await getQueue<ActionItem>("ACTIONS")

  const store = new Storage<{
    SELECTED_WALLET: string
  }>({
    SELECTED_WALLET: "",
  })

  let uiPort: browser.Runtime.Port | undefined
  let contentPort: browser.Runtime.Port | undefined

  browser.runtime.onConnect.addListener(async function (port) {
    if (!port.name.startsWith("argent-x")) {
      return console.warn("Not allowed", port.name)
    }
    if (port.name === "argent-x-content") {
      contentPort = port
      if (uiPort) {
        port.onMessage.addListener((data) => {
          uiPort?.postMessage(data)
        })
      }
    } else if (port.name === "argent-x-ui") {
      uiPort = port
      if (contentPort) {
        port.onMessage.addListener((data) => {
          contentPort?.postMessage(data)
        })
      }
    }

    console.log("CONNECT", port.name)
    const messenger = new Messenger<MessageType>(
      (emit) => {
        port.onMessage.addListener((data) => {
          console.log("BACKGROUND REC", data)
          if (data.from && data.type && allowedSender.includes(data.from)) {
            const { type, data: evData } = data
            emit(type, evData)
          }
        })
      },
      (type, data) => {
        console.log({ from: "BACKGROUND", type, data })
        port.postMessage({ from: "BACKGROUND", type, data })
      },
    )

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

          if (selectedWallet)
            return messenger.emit("CONNECT_RES", selectedWallet)
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
          const { secure, body } = data as MessageType["START_SESSION"]
          if (secure !== true)
            throw Error("session can only be started with encryption")
          const { plaintext } = await compactDecrypt(body, privateKey)
          const sessionPassword = encode.arrayBufferToString(plaintext)
          if (await validatePassword(sessionPassword)) {
            messenger.emit("START_SESSION_RES", undefined)
            return startSession(sessionPassword, undefined, () =>
              messenger.emit("STOP_SESSION", undefined),
            )
          }
          return messenger.emit("START_SESSION_REJ", undefined)
        }
        case "HAS_SESSION": {
          return messenger.emit("HAS_SESSION_RES", hasActiveSession())
        }
        case "STOP_SESSION": {
          return stopSession()
        }
        case "IS_INITIALIZED": {
          return messenger.emit("IS_INITIALIZED_RES", await existsL1())
        }
        case "GET_WALLETS": {
          return messenger.emit("GET_WALLETS_RES", await getWallets())
        }
        case "NEW_ACCOUNT": {
          const sessionPassword = getSession()
          if (!sessionPassword) throw Error("you need an open session")

          const newAccount = await createAccount(sessionPassword, (progress) =>
            messenger.emit("REPORT_PROGRESS", progress),
          )

          store.setItem("SELECTED_WALLET", newAccount.address)

          return messenger.emit("NEW_ACCOUNT_RES", newAccount)
        }
        case "SIGN": {
          const sessionPassword = getSession()
          if (!sessionPassword) throw Error("you need an open session")
          const l1 = await getL1(sessionPassword)
          const starkPair = ec.getKeyPair(l1.privateKey)
          const { hash } = data as MessageType["SIGN"]
          const { r, s } = ec.sign(starkPair, hash)
          return messenger.emit("SIGN_RES", {
            r: r.toString(),
            s: s.toString(),
          })
        }
      }
    })
  })
}

main()
