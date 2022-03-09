import browser from "webextension-polyfill"

import { sendMessage } from "../shared/messages"
import { MessageType } from "../shared/MessageType"

interface Tab {
  id: number
  host: string
}
const activeTabs: Tab[] = []

export function addTab(tab: Tab) {
  if (tab.id !== undefined && !hasTab(tab.id)) {
    activeTabs.push(tab)
  }
}

export function removeTab(tabId?: number) {
  if (tabId !== undefined && hasTab(tabId)) {
    activeTabs.splice(
      activeTabs.findIndex((tab) => tab.id === tabId),
      1,
    )
  }
}

export function hasTab(tabId?: number) {
  if (tabId === undefined) {
    return false
  }
  return activeTabs.some((tab) => tab.id === tabId)
}

browser.tabs.onRemoved.addListener(removeTab)

export function getTabIdsOfHost(host: string) {
  return activeTabs.filter((tab) => tab.host === host).map((tab) => tab.id)
}

export function removeTabOfHost(host: string) {
  getTabIdsOfHost(host).forEach((tabId) => {
    removeTab(tabId)
  })
}

export async function sendMessageToHost(
  message: MessageType,
  host: string,
): Promise<void> {
  const tabIds = getTabIdsOfHost(host)
  await Promise.allSettled(
    tabIds.map((tabId) => sendMessage(message, { tabId })),
  )
}

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
