import browser from "webextension-polyfill"

import { accountStore, getAccounts } from "../shared/account/store"
import { globalActionQueueStore } from "../shared/actionQueue/store"
import { ActionItem } from "../shared/actionQueue/types"
import { MessageType, messageStream } from "../shared/messages"
import { getNetwork } from "../shared/network"
import { migratePreAuthorizations } from "../shared/preAuthorizations"
import { delay } from "../shared/utils/delay"
import { migrateWallet } from "../shared/wallet/storeMigration"
import { walletStore } from "../shared/wallet/walletStore"
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
import { initOnboarding } from "./onboarding"
import { handlePreAuthorizationMessage } from "./preAuthorizationMessaging"
import { handleRecoveryMessage } from "./recoveryMessaging"
import { handleSessionMessage } from "./sessionMessaging"
import { handleTokenMessaging } from "./tokenMessaging"
import { initBadgeText } from "./transactions/badgeText"
import { transactionTracker } from "./transactions/tracking"
import { handleTransactionMessage } from "./transactions/transactionMessaging"
import { Wallet, sessionStore } from "./wallet"

browser.alarms.create("core:transactionTracker:history", {
  periodInMinutes: 5, // fetch history transactions every 5 minutes from voyager
})
browser.alarms.create("core:transactionTracker:update", {
  periodInMinutes: 1, // fetch transaction updates of existing transactions every minute from onchain
})
browser.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "core:transactionTracker:history") {
    console.info("~> fetching transaction history")
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

// badge shown on extension icon

initBadgeText()

// runs on startup

const handlers = [
  handleAccountMessage,
  handleActionMessage,
  handleMiscellaneousMessage,
  handleNetworkMessage,
  handlePreAuthorizationMessage,
  handleRecoveryMessage,
  handleSessionMessage,
  handleTransactionMessage,
  handleTokenMessaging,
] as Array<HandleMessage<MessageType>>

messageStream.subscribe(async ([msg, sender]) => {
  await Promise.all([migrateWallet(), migratePreAuthorizations()]) // do migrations before handling messages

  const messagingKeys = await getMessagingKeys()

  const wallet = new Wallet(
    walletStore,
    accountStore,
    sessionStore,
    loadContracts,
    getNetwork,
  )

  const actionQueue = await getQueue<ActionItem>(globalActionQueueStore)

  const background: BackgroundService = {
    wallet,
    transactionTracker,
    actionQueue,
  }

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

// open onboarding flow on initial install

initOnboarding()
