import { MessageType } from "../../shared/messages"
import { preAuthorizationService } from "../../shared/preAuthorization/service"
import { migrateWallet } from "../migrations/wallet/storeMigration"
import { backgroundActionService } from "../__new/services/action"
import { handleAccountMessage } from "../accountMessaging"
import { handleActionMessage } from "../actionMessaging"
import { addTab, hasTab, sendMessageToActiveTabs } from "../activeTabs"
import {
  BackgroundService,
  HandleMessage,
  UnhandledMessage,
} from "../background"
import { getMessagingKeys } from "../keys/messagingKeys"
import { handleMiscellaneousMessage } from "../miscellaneousMessaging"
import { handleNetworkMessage } from "../networkMessaging"
import {
  getOriginFromSender,
  handlePreAuthorizationMessage,
} from "../preAuthorizationMessaging"
import { respond } from "../respond"
import { handleTokenMessaging } from "../tokenMessaging"
import { transactionTrackerWorker } from "../transactions/service/worker"
import { handleTransactionMessage } from "../transactions/transactionMessaging"
import { handleUdcMessaging } from "../udcMessaging"
import { walletSingleton } from "../walletSingleton"
import { safeMessages, safeIfPreauthorizedMessages } from "./messages"
import browser from "webextension-polyfill"
import { feeTokenService } from "../../shared/feeToken/service"

const handlers = [
  handleAccountMessage,
  handleActionMessage,
  handleMiscellaneousMessage,
  handleNetworkMessage,
  handlePreAuthorizationMessage,
  handleTransactionMessage,
  handleTokenMessaging,
  handleUdcMessaging,
] as Array<HandleMessage<MessageType>>

export const handleMessage = async (
  [msg, sender]: [MessageType, browser.runtime.MessageSender],
  port?: browser.runtime.Port,
) => {
  await Promise.all([migrateWallet()]) // do migrations before handling messages

  const messagingKeys = await getMessagingKeys()

  /** TODO: refactor into background service singleton pattern */
  const background: BackgroundService = {
    wallet: walletSingleton,
    transactionTrackerWorker: transactionTrackerWorker,
    actionService: backgroundActionService,
    feeTokenService,
  }

  const extensionUrl = browser.runtime.getURL("")
  const safeOrigin = extensionUrl.replace(/\/$/, "")
  const origin = getOriginFromSender(sender)
  const isSafeOrigin = Boolean(origin === safeOrigin)

  const currentAccount = await walletSingleton.getSelectedAccount()
  const senderIsPreauthorized =
    !!currentAccount &&
    (await preAuthorizationService.isPreAuthorized({
      account: currentAccount,
      host: origin,
    }))

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

  if (sender.tab?.id && port) {
    await addTab({
      id: sender.tab?.id,
      host: origin,
      port,
    })
  }

  for (const handleMessage of handlers) {
    try {
      await handleMessage({
        msg,
        sender,
        origin,
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
