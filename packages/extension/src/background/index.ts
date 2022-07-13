import browser from "webextension-polyfill"

import { ActionItem } from "../shared/actionQueue"
import { MessageType, messageStream } from "../shared/messages"
import { getNetwork } from "../shared/network"
import { handleAccountMessage } from "./accountMessaging"
import { loadContracts } from "./accounts"
import { handleActionMessage } from "./actionMessaging"
import { getQueue } from "./actionQueue"
import {
  hasTab,
  sendMessageToActiveTabs,
  sendMessageToActiveTabsAndUi,
} from "./activeTabs"
import {
  BackgroundService,
  HandleMessage,
  UnhandledMessage,
} from "./background"
import { getMessagingKeys } from "./keys/messagingKeys"
import { handleMiscellaneousMessage } from "./miscellaneousMessaging"
import { handleNetworkMessage } from "./networkMessaging"
import { handlePreAuthorizationMessage } from "./preAuthorizationMessaging"
import { handleRecoveryMessage } from "./recoveryMessaging"
import { handleSessionMessage } from "./sessionMessaging"
import { handleSettingsMessage } from "./settingsMessaging"
import { Storage } from "./storage"
import { transactionTracker } from "./transactions/tracking"
import { handleTransactionMessage } from "./transactions/transactionMessaging"
import { Wallet, WalletStorageProps } from "./wallet"

browser.alarms.create("core:transactionTracker:history", {
  periodInMinutes: 5, // fetch history transactions every 5 minutes from voyager
})
browser.alarms.create("core:transactionTracker:update", {
  periodInMinutes: 1, // fetch transaction updates of existing transactions every minute from onchain
})
browser.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "core:transactionTracker:history") {
    console.info("~> fetching transaction history")
    const storage = new Storage<WalletStorageProps>({}, "wallet")
    const onAutoLock = () =>
      sendMessageToActiveTabsAndUi({ type: "DISCONNECT_ACCOUNT" })
    const wallet = new Wallet(storage, loadContracts, getNetwork, onAutoLock)
    await wallet.setup()
    await transactionTracker.loadHistory(await wallet.getAccounts())
  }
  if (alarm.name === "core:transactionTracker:update") {
    console.info("~> fetching transaction updates")
    await transactionTracker.update()
  }
})

// runs on startup
;(async () => {
  const messagingKeys = await getMessagingKeys()
  const storage = new Storage<WalletStorageProps>({}, "wallet")

  const onAutoLock = () =>
    sendMessageToActiveTabsAndUi({ type: "DISCONNECT_ACCOUNT" })
  const wallet = new Wallet(storage, loadContracts, getNetwork, onAutoLock)
  await wallet.setup()

  // may get reassigned when a recovery happens
  transactionTracker.loadHistory(await wallet.getAccounts()) // no await here to defer loading

  const actionQueue = await getQueue<ActionItem>({
    onUpdate: (actions) => {
      sendMessageToActiveTabsAndUi({
        type: "ACTIONS_QUEUE_UPDATE",
        data: { actions },
      })
    },
  })

  const background: BackgroundService = {
    wallet,
    transactionTracker,
    actionQueue,
  }

  const handlers = [
    handleAccountMessage,
    handleActionMessage,
    handleMiscellaneousMessage,
    handleNetworkMessage,
    handlePreAuthorizationMessage,
    handleRecoveryMessage,
    handleSessionMessage,
    handleSettingsMessage,
    handleTransactionMessage,
  ] as Array<HandleMessage<MessageType>>

  messageStream.subscribe(async ([msg, sender]) => {
    const sendToTabAndUi = async (msg: MessageType) => {
      sendMessageToActiveTabsAndUi(msg, [sender.tab?.id])
    }

    // forward UI messages to rest of the tabs
    if (!hasTab(sender.tab?.id)) {
      sendMessageToActiveTabs(msg)
    }

    for (const handleMessage of handlers) {
      try {
        await handleMessage({
          msg,
          sender,
          background,
          messagingKeys,
          sendToTabAndUi,
        })
      } catch (error) {
        if (error instanceof UnhandledMessage) {
          continue
        }
        throw error
      }
      break
    }
  })
})()
