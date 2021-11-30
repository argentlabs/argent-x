import { compactDecrypt } from "jose"
import { ec, encode } from "starknet"
import browser from "webextension-polyfill"

import { BackupWallet } from "../shared/backup.model"
import { messageStream, sendMessage } from "../shared/messages"
import { MessageType } from "../shared/MessageType"
import { ActionItem, getQueue } from "./actionQueue"
import { getKeyPair } from "./keys/communication"
import {
  createAccount,
  existsL1,
  getL1,
  getWallets,
  setKeystore,
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

let activeTabId: number | undefined
async function getCurrentTab() {
  return activeTabId
}
function setActiveTab(tabId?: number) {
  activeTabId = tabId
}

async function main() {
  const { privateKey, publicKeyJwk } = await getKeyPair()

  const actionQueue = await getQueue<ActionItem>("ACTIONS")

  const store = new Storage<{ SELECTED_WALLET: BackupWallet }>({
    SELECTED_WALLET: { address: "", network: "" },
  })

  messageStream.subscribe(async ([msg, sender]) => {
    const currentTab = await getCurrentTab()

    const sendToTabAndUi = async (msg: MessageType) => {
      sendMessage(msg, { tabId: sender.tab?.id })
      if (currentTab && currentTab !== sender.tab?.id) {
        sendMessage(msg, { tabId: currentTab })
      }
    }
    if (currentTab && currentTab !== sender.tab?.id) {
      sendMessage(msg, { tabId: currentTab })
    }

    switch (msg.type) {
      case "OPEN_UI": {
        return openUi()
      }

      case "ADD_TRANSACTION": {
        return await actionQueue.push({
          type: "TRANSACTION",
          payload: msg.data,
        })
      }

      case "GET_LATEST_ACTION_AND_COUNT": {
        const action = await actionQueue.getLatest()
        const count = await actionQueue.length()
        return sendToTabAndUi({
          type: "GET_LATEST_ACTION_AND_COUNT_RES",
          data: {
            action,
            count,
          },
        })
      }

      case "GET_SELECTED_WALLET_ADDRESS": {
        const { address } = await store.getItem("SELECTED_WALLET")

        return sendToTabAndUi({
          type: "GET_SELECTED_WALLET_ADDRESS_RES",
          data: address,
        })
      }

      case "CONNECT": {
        const selectedWallet = await store.getItem("SELECTED_WALLET")
        const isWhitelisted = await isOnWhitelist(msg.data.host)

        setActiveTab(sender.tab?.id)
        if (!isWhitelisted) {
          actionQueue.push({
            type: "CONNECT",
            payload: { host: msg.data.host },
          })
        }

        if (isWhitelisted && selectedWallet.address)
          return sendToTabAndUi({ type: "CONNECT_RES", data: selectedWallet })

        return openUi()
      }

      case "WALLET_CONNECTED": {
        return store.setItem("SELECTED_WALLET", msg.data)
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
          payload: { host: msg.data },
        })
      }
      case "APPROVE_WHITELIST": {
        const selectedWallet = await store.getItem("SELECTED_WALLET")

        await actionQueue.removeLatest()
        await addToWhitelist(msg.data)

        if (selectedWallet)
          return sendToTabAndUi({ type: "CONNECT_RES", data: selectedWallet })
        return openUi()
      }
      case "REJECT_WHITELIST": {
        return actionQueue.removeLatest()
      }
      case "REMOVE_WHITELIST": {
        return removeFromWhitelist(msg.data)
      }
      case "IS_WHITELIST": {
        const valid = await isOnWhitelist(msg.data)
        return sendToTabAndUi({ type: "IS_WHITELIST_RES", data: valid })
      }
      case "RESET_WHITELIST": {
        setToStorage(`WHITELIST:APPROVED`, [])
        setToStorage(`WHITELIST:PENDING`, [])
        return
      }
      case "REQ_PUB": {
        return sendToTabAndUi({ type: "REQ_PUB_RES", data: publicKeyJwk })
      }
      case "START_SESSION": {
        const { secure, body } = msg.data
        if (secure !== true)
          throw Error("session can only be started with encryption")
        const { plaintext } = await compactDecrypt(body, privateKey)
        const sessionPassword = encode.arrayBufferToString(plaintext)
        if (await validatePassword(sessionPassword)) {
          sendToTabAndUi({ type: "START_SESSION_RES" })
          return startSession(sessionPassword, undefined, () =>
            sendToTabAndUi({ type: "STOP_SESSION" }),
          )
        }
        return sendToTabAndUi({ type: "START_SESSION_REJ" })
      }
      case "HAS_SESSION": {
        return sendToTabAndUi({
          type: "HAS_SESSION_RES",
          data: hasActiveSession(),
        })
      }
      case "STOP_SESSION": {
        return stopSession()
      }
      case "IS_INITIALIZED": {
        return sendToTabAndUi({
          type: "IS_INITIALIZED_RES",
          data: await existsL1(),
        })
      }
      case "GET_WALLETS": {
        return sendToTabAndUi({
          type: "GET_WALLETS_RES",
          data: await getWallets(),
        })
      }
      case "NEW_ACCOUNT": {
        const sessionPassword = getSession()
        if (!sessionPassword) throw Error("you need an open session")

        const network = msg.data
        const newAccount = await createAccount(sessionPassword, network)

        const wallet = { address: newAccount.address, network }
        store.setItem("SELECTED_WALLET", wallet)

        return sendToTabAndUi({ type: "NEW_ACCOUNT_RES", data: newAccount })
      }
      case "SIGN": {
        const sessionPassword = getSession()
        if (!sessionPassword) throw Error("you need an open session")
        const l1 = await getL1(sessionPassword)
        const starkPair = ec.getKeyPair(l1.privateKey)
        const { hash } = msg.data
        const { r, s } = ec.sign(starkPair, hash)
        return sendToTabAndUi({
          type: "SIGN_RES",
          data: {
            r: r.toString(),
            s: s.toString(),
          },
        })
      }
      case "RECOVER_KEYSTORE": {
        await setKeystore(msg.data)
        return sendToTabAndUi({ type: "RECOVER_KEYSTORE_RES" })
      }
    }
  })
}
main()
