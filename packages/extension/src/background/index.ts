import { ActionItem } from "../shared/actionQueue"
import { MessageType, messageStream } from "../shared/messages"
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
import { getNetwork as getNetworkImplementation } from "./customNetworks"
import { getMessagingKeys } from "./keys/messagingKeys"
import { handleMiscellaneousMessage } from "./miscellaneousMessaging"
import { handleNetworkMessage } from "./networkMessaging"
import { handlePreAuthorizationMessage } from "./preAuthorizationMessaging"
import { handleRecoveryMessage } from "./recoveryMessaging"
import { handleSessionMessage } from "./sessionMessaging"
import { handleSettingsMessage } from "./settingsMessaging"
import { Storage } from "./storage"
import { handleTokenMessage } from "./tokenMessaging"
import { trackTransations } from "./transactions/notifications"
import { getTransactionsStore } from "./transactions/store"
import { handleTransactionMessage } from "./transactions/transactionMessaging"
import { getTransactionsTracker } from "./transactions/transactions"
import { fetchVoyagerTransactions } from "./transactions/voyager"
import { Wallet, WalletStorageProps } from "./wallet"
;(async () => {
  const messagingKeys = await getMessagingKeys()
  const storage = new Storage<WalletStorageProps>({}, "wallet")

  const onAutoLock = () =>
    sendMessageToActiveTabsAndUi({ type: "DISCONNECT_ACCOUNT" })
  const wallet = new Wallet(
    storage,
    loadContracts,
    getNetworkImplementation,
    onAutoLock,
  )
  await wallet.setup()

  // may get reassigned when a recovery happens
  const transactionTracker = getTransactionsTracker(
    getTransactionsStore,
    fetchVoyagerTransactions,
    trackTransations,
  )
  transactionTracker.load(await wallet.getAccounts()) // no await here to defer loading

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
    handleTokenMessage,
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
