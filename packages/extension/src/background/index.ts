import { ActionItem } from "../shared/actionQueue"
import { MessageType } from "../shared/messages"
import { messageStream } from "../shared/messages"
import { handleAccountMessage } from "./accountMessaging"
import { loadContracts } from "./accounts"
import { getQueue } from "./actionQueue"
import {
  hasTab,
  sendMessageToActiveTabs,
  sendMessageToActiveTabsAndUi,
} from "./activeTabs"
import { BackgroundService, UnhandledMessage } from "./background"
import { getNetwork as getNetworkImplementation } from "./customNetworks"
import { getKeyPair } from "./keys/communication"
import { handleMiscMessage } from "./miscMessaging"
import { Storage } from "./storage"
import { trackTransations } from "./transactions/notifications"
import { getTransactionsStore } from "./transactions/store"
import { handleTransactionMessage } from "./transactions/transactionMessaging"
import { getTransactionsTracker } from "./transactions/transactions"
import { Wallet, WalletStorageProps } from "./wallet"
;(async () => {
  const keyPair = await getKeyPair()

  const storage = new Storage<WalletStorageProps>({}, "wallet")
  const onAutoLock = () =>
    sendMessageToActiveTabsAndUi({ type: "DISCONNECT_ACCOUNT" })
  const wallet = new Wallet(
    storage,
    ...(await loadContracts()),
    getNetworkImplementation,
    onAutoLock,
  )
  await wallet.setup()

  // may get reassigned when a recovery happens
  const transactionTracker = await getTransactionsTracker(
    await wallet.getAccounts(),
    getTransactionsStore,
    trackTransations,
  )

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

  messageStream.subscribe(async ([msg, sender]) => {
    const sendToTabAndUi = async (msg: MessageType) => {
      sendMessageToActiveTabsAndUi(msg, [sender.tab?.id])
    }
    // forward UI messages to rest of the tabs
    if (!hasTab(sender.tab?.id)) {
      sendMessageToActiveTabs(msg)
    }

    const handlers = [
      handleAccountMessage,
      handleTransactionMessage,
      handleMiscMessage,
    ]

    for (const handleMessage of handlers) {
      try {
        await handleMessage({
          msg,
          sender,
          background,
          keyPair,
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
