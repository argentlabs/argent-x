import type { MessageType } from "../shared/messages"
import {
  sendMessageToActiveTabsAndUi,
  sendMessageToHost,
  sendMessageToUi,
} from "./activeTabs"
import { safeMessages } from "./messageHandling/messages"

/** TODO: refactor */
export const respond = async (msg: MessageType) => {
  if (safeMessages.includes(msg.type)) {
    await sendMessageToActiveTabsAndUi(msg)
  } else {
    await sendMessageToUi(msg)
  }
}

export const respondToHost = async (msg: MessageType, host: string) => {
  if (safeMessages.includes(msg.type)) {
    await sendMessageToHost(msg, host)
  } else {
    await sendMessageToUi(msg)
  }
}

export type Respond = typeof respond
export type RespondToHost = typeof respondToHost
