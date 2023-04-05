import { StarknetMethodArgumentsSchemas } from "@argent/x-window"
import browser from "webextension-polyfill"

import { accountStore, getAccounts } from "../shared/account/store"
import { globalActionQueueStore } from "../shared/actionQueue/store"
import { ActionItem } from "../shared/actionQueue/types"
import { MessageType, messageStream } from "../shared/messages"
import {
  multisigBaseWalletStore,
  pendingMultisigStore,
} from "../shared/multisig/store"
import { multisigTracker } from "../shared/multisig/tracking"
import { getNetwork } from "../shared/network"
import {
  isPreAuthorized,
  migratePreAuthorizations,
} from "../shared/preAuthorizations"
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
  sendMessageToUi,
} from "./activeTabs"
import {
  BackgroundService,
  HandleMessage,
  UnhandledMessage,
} from "./background"
import { getMessagingKeys } from "./keys/messagingKeys"
import { handleMiscellaneousMessage } from "./miscellaneousMessaging"
import { handleMultisigMessage } from "./multisigMessaging"
import { handleNetworkMessage } from "./networkMessaging"
import { initOnboarding } from "./onboarding"
import {
  getOriginFromSender,
  handlePreAuthorizationMessage,
} from "./preAuthorizationMessaging"
import { handleRecoveryMessage } from "./recoveryMessaging"
import { handleSessionMessage } from "./sessionMessaging"
import { handleShieldMessage } from "./shieldMessaging"
import { handleTokenMessaging } from "./tokenMessaging"
import { initBadgeText } from "./transactions/badgeText"
import { transactionTracker } from "./transactions/tracking"
import { handleTransactionMessage } from "./transactions/transactionMessaging"
import { handleUdcMessaging } from "./udcMessaging"
import { Wallet, sessionStore } from "./wallet"

const DEFAULT_POLLING_INTERVAL = 15
const LOCAL_POLLING_INTERVAL = 5

const enum ALARM_NAMES {
  TRANSACTION_TRACKER_HISTORY = "core:transactionTracker:history",
  TRANSACTION_TRACKER_UPDATE = "core:transactionTracker:update",
  MULTISIG_ACCOUNT_UPDATE = "core:multisig:updateDataForAccounts",
  MULTISIG_PENDING_MULTISIG_UPDATE = "core:multisig:updateDataForPendingMultisig",
  MULTISIG_TRANSACTION_TRACKER = "core:multisig:transactionTracker",
}

browser.alarms.create(ALARM_NAMES.TRANSACTION_TRACKER_HISTORY, {
  periodInMinutes: 5, // fetch history transactions every 5 minutes from voyager
})
browser.alarms.create(ALARM_NAMES.TRANSACTION_TRACKER_UPDATE, {
  periodInMinutes: 1, // fetch transaction updates of existing transactions every minute from onchain
})
browser.alarms.create(ALARM_NAMES.MULTISIG_ACCOUNT_UPDATE, {
  periodInMinutes: 1, // fetch multisig updates of existing multisigs every 5 minutes from backend
})
browser.alarms.create(ALARM_NAMES.MULTISIG_PENDING_MULTISIG_UPDATE, {
  periodInMinutes: 1, // fetch pending multisig updates of existing multisigs every 3 minutes from backend
})
browser.alarms.create(ALARM_NAMES.MULTISIG_TRANSACTION_TRACKER, {
  periodInMinutes: 1, // fetch transaction updates of existing multisig every 2 minutes from backend
})

browser.alarms.onAlarm.addListener(async (alarm) => {
  switch (alarm.name) {
    case ALARM_NAMES.TRANSACTION_TRACKER_HISTORY: {
      console.info("~> fetching transaction history")
      await transactionTracker.loadHistory(await getAccounts())
      break
    }

    case ALARM_NAMES.MULTISIG_ACCOUNT_UPDATE: {
      console.info("~> fetching multisig account updates")
      await multisigTracker.updateDataForAccounts()
      break
    }

    case ALARM_NAMES.MULTISIG_PENDING_MULTISIG_UPDATE: {
      console.info("~> fetching pending multisig account updates")
      await multisigTracker.updateDataForPendingMultisig()
      break
    }

    case ALARM_NAMES.MULTISIG_TRANSACTION_TRACKER: {
      console.info("~> fetching multisig transaction updates")
      await multisigTracker.updateTransactions()
      break
    }

    case ALARM_NAMES.TRANSACTION_TRACKER_UPDATE: {
      console.info("~> fetching transaction updates")
      let inFlightTransactions = await transactionTracker.update()
      // the config below will run transaction updates 4x per minute, if there are in-flight transactions
      // By default it will update on second 0, 15, 30 and 45 but by updating WAIT_TIME we can change the number of executions
      const maxExecutionTimeInMs = 60000 // 1 minute max execution time
      let transactionPollingIntervalInS = DEFAULT_POLLING_INTERVAL
      const startTime = Date.now()

      while (
        inFlightTransactions.length > 0 &&
        Date.now() - startTime < maxExecutionTimeInMs
      ) {
        const localTransaction = inFlightTransactions.find(
          (tx) => tx.account.networkId === "localhost",
        )
        if (localTransaction) {
          transactionPollingIntervalInS = LOCAL_POLLING_INTERVAL
        } else {
          transactionPollingIntervalInS = DEFAULT_POLLING_INTERVAL
        }
        console.info(
          `~> waiting ${transactionPollingIntervalInS}s for transaction updates`,
        )
        await delay(transactionPollingIntervalInS * 1000)
        console.info(
          "~> fetching transaction updates as pending transactions were detected",
        )
        inFlightTransactions = await transactionTracker.update()
      }
      break
    }

    default:
      break
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
  handleUdcMessaging,
  handleShieldMessage,
  handleMultisigMessage,
] as Array<HandleMessage<MessageType>>

getAccounts()
  .then((x) => transactionTracker.loadHistory(x))
  .catch(() => console.warn("failed to load transaction history"))

const safeMessages: MessageType["type"][] = [
  "IS_PREAUTHORIZED",
  "CONNECT_DAPP",
  "DISCONNECT_ACCOUNT",
  "OPEN_UI",
  // answers
  "EXECUTE_TRANSACTION_RES",
  "TRANSACTION_SUBMITTED",
  "TRANSACTION_FAILED",
  "SIGN_MESSAGE_RES",
  "SIGNATURE_SUCCESS",
  "SIGNATURE_FAILURE",
  "IS_PREAUTHORIZED_RES",
  "REQUEST_TOKEN_RES",
  "APPROVE_REQUEST_TOKEN",
  "REJECT_REQUEST_TOKEN",
  "REQUEST_ADD_CUSTOM_NETWORK_RES",
  "APPROVE_REQUEST_ADD_CUSTOM_NETWORK",
  "REJECT_REQUEST_ADD_CUSTOM_NETWORK",
  "REQUEST_SWITCH_CUSTOM_NETWORK_RES",
  "APPROVE_REQUEST_SWITCH_CUSTOM_NETWORK",
  "REJECT_REQUEST_SWITCH_CUSTOM_NETWORK",
  "CONNECT_DAPP_RES",
  "CONNECT_ACCOUNT_RES",
  "CONNECT_ACCOUNT",
  "REJECT_PREAUTHORIZATION",
  "REQUEST_DECLARE_CONTRACT_RES",
  "DECLARE_CONTRACT_ACTION_FAILED",
  "DECLARE_CONTRACT_ACTION_SUBMITTED",
]

const safeIfPreauthorizedMessages: MessageType["type"][] = [
  "EXECUTE_TRANSACTION",
  "SIGN_MESSAGE",
  "REQUEST_TOKEN",
  "REQUEST_ADD_CUSTOM_NETWORK",
  "REQUEST_SWITCH_CUSTOM_NETWORK",
  "REQUEST_DECLARE_CONTRACT",
]

const handleMessage = async (
  [msg, sender]: [MessageType, browser.runtime.MessageSender],
  port?: browser.runtime.Port,
) => {
  await Promise.all([migrateWallet(), migratePreAuthorizations()]) // do migrations before handling messages

  const messagingKeys = await getMessagingKeys()

  const wallet = new Wallet(
    walletStore,
    accountStore,
    sessionStore,
    multisigBaseWalletStore,
    pendingMultisigStore,
    loadContracts,
    getNetwork,
  )

  const actionQueue = await getQueue<ActionItem>(globalActionQueueStore)

  const background: BackgroundService = {
    wallet,
    transactionTracker,
    actionQueue,
  }

  const extensionUrl = browser.extension.getURL("")
  const safeOrigin = extensionUrl.replace(/\/$/, "")
  const origin = getOriginFromSender(sender)
  const isSafeOrigin = Boolean(origin === safeOrigin)

  const currentAccount = await wallet.getSelectedAccount()
  const senderIsPreauthorized =
    !!currentAccount && (await isPreAuthorized(currentAccount, origin))

  if (
    !isSafeOrigin && // allow all messages from the extension itself
    !safeMessages.includes(msg.type) && // allow messages that are needed to get into preauthorization state
    !(senderIsPreauthorized && safeIfPreauthorizedMessages.includes(msg.type)) // allow additional messages if sender is preauthorized
  ) {
    console.warn(
      `received message of type ${msg.type} from ${origin} but it is not allowed`,
    )
    return // this return must not be removed
  }

  // forward UI messages to rest of the tabs
  if (isSafeOrigin) {
    if (await hasTab(sender.tab?.id)) {
      await sendMessageToActiveTabs(msg)
    }
  }

  const respond = async (msg: MessageType) => {
    if (safeMessages.includes(msg.type)) {
      await sendMessageToActiveTabsAndUi(msg)
    } else {
      await sendMessageToUi(msg)
    }
  }

  for (const handleMessage of handlers) {
    try {
      await handleMessage({
        msg,
        sender,
        background,
        messagingKeys,
        port,
        respond,
      })
    } catch (error) {
      if (error instanceof UnhandledMessage) {
        continue
      }
      throw error
    }
    break
  }
}

browser.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener(async (msg: MessageType, port) => {
    const sender = port.sender
    if (sender) {
      switch (msg.type) {
        case "EXECUTE_TRANSACTION": {
          const [transactions, abis, transactionsDetail] =
            await StarknetMethodArgumentsSchemas.execute.parseAsync([
              msg.data.transactions,
              msg.data.abis,
              msg.data.transactionsDetail,
            ])
          return handleMessage(
            [
              { ...msg, data: { transactions, abis, transactionsDetail } },
              sender,
            ],
            port,
          )
        }

        case "SIGN_MESSAGE": {
          const [message] =
            await StarknetMethodArgumentsSchemas.signMessage.parseAsync([
              msg.data,
            ])
          return handleMessage([{ ...msg, data: message }, sender], port)
        }

        default:
          return handleMessage([msg, sender], port)
      }
    }
  })
})

messageStream.subscribe(handleMessage)

// open onboarding flow on initial install

initOnboarding()
