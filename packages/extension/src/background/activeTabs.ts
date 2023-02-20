import browser from "webextension-polyfill"

import { MessageType, sendMessage } from "../shared/messages"

interface Tab {
  id: number
  host: string
  port: browser.runtime.Port
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
  const tabs = activeTabs.filter((tab) => tabIds.includes(tab.id))
  await Promise.allSettled(tabs.map((tab) => tab.port.postMessage(message)))
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
    const tab = activeTabs.find((tab) => tab.id === tabId)
    if (tab) {
      promises.push(tab.port.postMessage(message))
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
