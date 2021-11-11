import { InvokeFunctionTransaction } from "starknet"
import browser from "webextension-polyfill"

import { Messenger } from "./utils/Messenger"

const allowedSender = ["INJECT", "UI", "INPAGE"]

browser.runtime.onConnect.addListener(function (port) {
  if (port.name !== "argent-x-content") return
  browser.runtime.onConnect.addListener(function (uiPort) {
    if (uiPort.name !== "argent-x-ui") return
    const uiToContentForwarder = async (data: any) => {
      console.log("FORWARD UI->CONTENT")
      port.postMessage(data)
    }
    const contentToUiForwarder = async (data: any) => {
      console.log("FORWARD CONTENT->UI")
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

  const messenger = new Messenger(
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

  const NOTIFICATION_WIDTH = 322
  const NOTIFICATION_HEIGHT = 610

  async function addTransaction(tx: InvokeFunctionTransaction): Promise<void> {
    const { txQueue = [] } = (await browser.storage.local.get("txQueue")) as {
      txQueue: InvokeFunctionTransaction[]
    }
    txQueue.push(tx)
    return browser.storage.local.set({ txQueue })
  }

  async function removeTransaction(
    tx: InvokeFunctionTransaction,
  ): Promise<void> {
    const { txQueue = [] } = (await browser.storage.local.get("txQueue")) as {
      txQueue: InvokeFunctionTransaction[]
    }
    return browser.storage.local.set({
      txQueue: txQueue.filter(
        (item) =>
          !(
            item.contract_address === tx.contract_address &&
            item.calldata?.toString() === tx.calldata?.toString() &&
            item.entry_point_selector === tx.entry_point_selector
          ),
      ),
    })
  }

  async function getFromStorage<
    T extends any,
    K extends string = string,
  >(key: K): Promise<T> {
    return (await browser.storage.local.get(key))[key]
  }

  function setToStorage(key: string, value: any) {
    return browser.storage.local.set({ [key]: value })
  }

  async function getTransactions(): Promise<InvokeFunctionTransaction[]> {
    return (await getFromStorage<InvokeFunctionTransaction[]>("txQueue")) || []
  }

  function getSelectedWalletAddress(): Promise<string | undefined> {
    return getFromStorage<string | undefined>("selectedWallet")
  }

  async function openUi() {
    const [existingPopup] = await browser.tabs.query({
      url: browser.runtime.getURL("/index.html"),
    })

    if (existingPopup && existingPopup.windowId)
      return browser.windows.update(existingPopup.windowId, { focused: true })

    let left = 0
    let top = 0
    try {
      const lastFocused = await browser.windows.getLastFocused()

      // Position window in top right corner of lastFocused window.
      top = lastFocused.top ?? 0
      left =
        (lastFocused.left ?? 0) +
        Math.max((lastFocused.width ?? 0) - NOTIFICATION_WIDTH, 0)
    } catch (_) {
      // The following properties are more than likely 0, due to being
      // opened from the background chrome process for the extension that
      // has no physical dimensions
      const { screenX, screenY, outerWidth } = window
      top = Math.max(screenY, 0)
      left = Math.max(screenX + (outerWidth - NOTIFICATION_WIDTH), 0)
    }
    const popup = await browser.windows.create({
      url: "index.html",
      type: "popup",
      width: NOTIFICATION_WIDTH,
      height: NOTIFICATION_HEIGHT,
      left,
      top,
    })

    return popup
  }

  messenger.listen(async (type, data) => {
    console.log("BACKGROUND", type, data)
    switch (type) {
      case "OPEN_UI": {
        return openUi()
      }

      case "ADD_TRANSACTION": {
        return await addTransaction(data)
      }

      case "READ_REQUESTED_TRANSACTIONS": {
        const txs = await getTransactions()
        return messenger.emit("READ_REQUESTED_TRANSACTIONS_RES", txs)
      }

      case "GET_SELECTED_WALLET_ADDRESS": {
        const selectedWallet = await getSelectedWalletAddress()

        return messenger.emit("GET_SELECTED_WALLET_ADDRESS_RES", selectedWallet)
      }

      case "CONNECT": {
        const selectedWallet = await getSelectedWalletAddress()

        if (selectedWallet)
          return messenger.emit("WALLET_CONNECTED", selectedWallet)

        return openUi()
      }

      case "WALLET_CONNECTED": {
        return setToStorage("selectedWallet", data)
      }

      case "SUBMITTED_TX":
      case "FAILED_TX": {
        const { tx } = data
        console.log("rm", tx)
        return removeTransaction(tx)
      }

      case "RESET_ALL": {
        return browser.storage.local.clear()
      }
    }
  })
})
