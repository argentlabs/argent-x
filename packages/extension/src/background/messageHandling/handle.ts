import type { MessageType } from "../../shared/messages/types"
import { preAuthorizationService } from "../../shared/preAuthorization"
import { migrateWallet } from "../migrations/wallet/storeMigration"
import { backgroundActionService } from "../services/action"
import { handleAccountMessage } from "../accountMessaging"
import { handleActionMessage } from "../actionMessaging"
import { addTab, hasTab, sendMessageToActiveTabs } from "../activeTabs"
import type { BackgroundService, HandleMessage } from "../background"
import { UnhandledMessage } from "../background"
import { getMessagingKeys } from "../keys/messagingKeys"
import { handleMiscellaneousMessage } from "../miscellaneousMessaging"
import { handleNetworkMessage } from "../networkMessaging"
import { handlePreAuthorizationMessage } from "../preAuthorizationMessaging"
import { getIsSafeMessageSender } from "../../shared/messages/getIsSafeMessageSender"
import { respond } from "../respond"
import { handleTokenMessaging } from "../tokenMessaging"
import { transactionTrackerWorker } from "../services/transactionTracker/worker"
import { handleTransactionMessage } from "../transactions/transactionMessaging"
import { handleUdcMessaging } from "../udcMessaging"
import { walletSingleton } from "../walletSingleton"
import { safeMessages, safeIfPreauthorizedMessages } from "./messages"
import type browser from "webextension-polyfill"
import { feeTokenService } from "../../shared/feeToken/service"
import { z } from "zod"
import { getOriginFromSender } from "../../shared/messages/getOriginFromSender"

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

const argentXMessageSchema = z.object({
  type: z.string(),
  payload: z.unknown().optional(),
})

export const handleMessage = async (
  [msg, sender]: [MessageType, browser.runtime.MessageSender],
  port?: browser.runtime.Port,
) => {
  const { success } = argentXMessageSchema.safeParse(msg)
  if (!success) {
    console.warn("Invalid message schema received. Ignoring.")
    return
  }

  await Promise.all([migrateWallet()]) // do migrations before handling messages

  const messagingKeys = await getMessagingKeys()

  /** TODO: refactor into background service singleton pattern */
  const background: BackgroundService = {
    wallet: walletSingleton,
    transactionTrackerWorker: transactionTrackerWorker,
    actionService: backgroundActionService,
    feeTokenService,
  }

  const isSafeOrigin = getIsSafeMessageSender(sender)
  const senderOrigin = getOriginFromSender(sender)

  const currentAccount = await walletSingleton.getSelectedAccount()
  const senderIsPreauthorized =
    !!currentAccount &&
    (await preAuthorizationService.isPreAuthorized({
      account: currentAccount,
      host: senderOrigin,
    }))

  if (
    !isSafeOrigin && // allow all messages from the extension itself
    !safeMessages.includes(msg.type) && // allow messages that are needed to get into preauthorization state
    !(senderIsPreauthorized && safeIfPreauthorizedMessages.includes(msg.type)) // allow additional messages if sender is preauthorized
  ) {
    console.warn(
      `received message of type ${msg.type} from ${senderOrigin} but it is not allowed`,
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
      host: senderOrigin,
      port,
    })
  }

  for (const handleMessage of handlers) {
    try {
      await handleMessage({
        msg,
        sender,
        origin: senderOrigin,
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
