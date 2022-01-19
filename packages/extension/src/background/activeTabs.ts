import browser from "webextension-polyfill"

import { sendMessage } from "../shared/messages"
import { MessageType } from "../shared/MessageType"

const activeTabs = new Set<number>([])

export function addTab(tabId?: number) {
  if (tabId === undefined) return
  if (hasTab(tabId)) return

  activeTabs.add(tabId)
}

export function hasTab(tabId?: number) {
  if (!tabId) {
    return false
  }
  return activeTabs.has(tabId)
}

browser.tabs.onRemoved.addListener((tabId) => {
  activeTabs.delete(tabId)
})

export async function sendMessageToActiveTabs(
  message: MessageType,
  additionalTargets: (number | undefined)[] = [],
): Promise<void> {
  const promises = []
  for (const tabId of activeTabs) {
    promises.push(sendMessage(message, { tabId }))
  }
  for (const tabId of additionalTargets) {
    if (tabId !== undefined) {
      promises.push(sendMessage(message, { tabId }))
    }
  }
  await Promise.allSettled(promises)
}

export async function sendMessageToUi(message: MessageType) {
  await Promise.allSettled([sendMessage(message)])
}

export async function sendMessageToActiveTabsAndUi(
  message: MessageType,
  additionalTargets: (number | undefined)[] = [],
) {
  await sendMessageToUi(message)
  await sendMessageToActiveTabs(message)
}
