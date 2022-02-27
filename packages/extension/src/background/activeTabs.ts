import browser from "webextension-polyfill"

import { sendMessage } from "../shared/messages"
import { MessageType } from "../shared/MessageType"

type Tab = { id: number; origin: string }
const activeTabs: Tab[] = []

export function addTab(tab: Tab) {
  if (tab.id !== undefined && !hasTab(tab.id)) {
    activeTabs.push(tab)
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
  return activeTabs.some((tab) => tab.id === tabId)
}

browser.tabs.onRemoved.addListener((tabId) => {
  activeTabs.splice(
    activeTabs.findIndex((tab) => tab.id === tabId),
    1,
  )
})

export async function sendMessageToActiveTabs(
  message: MessageType,
  additionalTargets: Array<number | undefined> = [],
): Promise<void> {
  const promises = []
  // Set avoids duplicates
  for (const tabId of new Set([
    ...activeTabs.map((tab) => tab.id),
    ...additionalTargets,
  ])) {
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
