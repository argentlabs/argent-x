import browser from "webextension-polyfill"

import { accountStore, getAccounts } from "../shared/account/store"
import { globalActionQueueStore } from "../shared/actionQueue/store"
import { ActionItem } from "../shared/actionQueue/types"
import { MessageType, messageStream } from "../shared/messages"
import { getNetwork } from "../shared/network"
import { delay } from "../shared/utils/delay"
import { migrateWallet } from "../shared/wallet/storeMigration"
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
import { transactionTracker } from "./transactions/tracking"
import { handleTransactionMessage } from "./transactions/transactionMessaging"
import { Wallet, walletStore } from "./wallet"

browser.alarms.create("core:transactionTracker:history", {
  periodInMinutes: 5, // fetch history transactions every 5 minutes from voyager
})
browser.alarms.create("core:transactionTracker:update", {
  periodInMinutes: 1, // fetch transaction updates of existing transactions every minute from onchain
})
browser.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "core:transactionTracker:history") {
    console.info("~> fetching transaction history")

    const onAutoLock = () =>
      sendMessageToActiveTabsAndUi({ type: "DISCONNECT_ACCOUNT" })
    const wallet = new Wallet(
      walletStore,
      accountStore,
      loadContracts,
      getNetwork,
      onAutoLock,
    )
    await wallet.setup()
    await transactionTracker.loadHistory(await getAccounts())
  }
  if (alarm.name === "core:transactionTracker:update") {
    console.info("~> fetching transaction updates")
    let hasInFlightTransactions = await transactionTracker.update()

    // the config below will run transaction updates 4x per minute, if there are in-flight transactions
    // it will update on second 0, 15, 30 and 45
    const maxRetries = 3 // max 3 retries
    const waitTimeInS = 15 // wait 15 seconds between retries

    let runs = 0
    while (hasInFlightTransactions && runs < maxRetries) {
      console.info(`~> waiting ${waitTimeInS}s for transaction updates`)
      await delay(waitTimeInS * 1000)
      console.info(
        "~> fetching transaction updates as pending transactions were detected",
      )
      runs++
      hasInFlightTransactions = await transactionTracker.update()
    }
  }
})

// runs on startup
;(async () => {
  await migrateWallet()

  const messagingKeys = await getMessagingKeys()

  const onAutoLock = () =>
    sendMessageToActiveTabsAndUi({ type: "DISCONNECT_ACCOUNT" })
  const wallet = new Wallet(
    walletStore,
    accountStore,
    loadContracts,
    getNetwork,
    onAutoLock,
  )
  await wallet.setup()

  // may get reassigned when a recovery happens
  transactionTracker.loadHistory(await getAccounts()) // no await here to defer loading

  const actionQueue = await getQueue<ActionItem>(globalActionQueueStore)

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
