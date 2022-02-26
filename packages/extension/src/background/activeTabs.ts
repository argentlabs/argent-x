import browser from "webextension-polyfill"

import { sendMessage } from "../shared/messages"
import { MessageType } from "../shared/MessageType"

const activeTabs = new Set<number>()

export function addTab(tabId?: number) {
  if (tabId !== undefined && !hasTab(tabId)) {
    activeTabs.add(tabId)
  }
}

export function removeTab(tabId?: number) {
  if (tabId !== undefined && hasTab(tabId)) {
    activeTabs.delete(tabId)
  }
}

export function hasTab(tabId?: number) {
  if (tabId === undefined) {
    return false
  }
  return activeTabs.has(tabId)
}

browser.tabs.onRemoved.addListener((tabId) => {
  activeTabs.delete(tabId)
})

export async function sendMessageToActiveTabs(
  message: MessageType,
  additionalTargets: Array<number | undefined> = [],
): Promise<void> {
  const promises = []
  // Set avoids duplicates
  for (const tabId of new Set([...activeTabs, ...additionalTargets])) {
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
  additionalTargets: Array<number | undefined> = [],
) {
  await sendMessageToUi(message)
  await sendMessageToActiveTabs(message, additionalTargets)
}
