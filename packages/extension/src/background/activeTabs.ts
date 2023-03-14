import browser from "webextension-polyfill"

import { MessageType, sendMessage } from "../shared/messages"
import { ArrayStorage } from "../shared/storage"

interface Tab {
  id: number
  host: string
  port: browser.runtime.Port
}
const activeTabs = new ArrayStorage<Tab>([], {
  namespace: "core:activeTabs",
  areaName: "session",
  compare(a, b) {
    return a.id === b.id
  },
})

browser.tabs.onRemoved.addListener(removeTab)

export async function addTab(tab: Tab) {
  if (tab.id !== undefined) {
    return activeTabs.push(tab)
  }
}

export function removeTab(tabId?: number) {
  return activeTabs.remove((tab) => tab.id === tabId)
}

export async function hasTab(tabId?: number) {
  if (tabId === undefined) {
    return false
  }
  const [hit] = await activeTabs.get((tab) => tab.id === tabId)
  return Boolean(hit)
}

export async function getTabIdsOfHost(host: string) {
  const hits = await activeTabs.get((tab) => tab.host === host)
  return hits ? hits.map((tab) => tab.id) : []
}

export async function sendMessageToHost(
  message: MessageType,
  host: string,
): Promise<void> {
  const tabIds = await getTabIdsOfHost(host)
  const tabs = await activeTabs.get((tab) => tabIds.includes(tab.id))

  for (const tab of tabs) {
    try {
      tab.port.postMessage(message)
    } catch (e) {
      console.warn(e)
    }
  }
}

export async function sendMessageToActiveTabs(
  message: MessageType,
): Promise<void> {
  const tabs = await activeTabs.get()

  for (const tab of tabs) {
    try {
      tab.port.postMessage(message)
    } catch (e) {
      console.warn(e)
    }
  }
}

export async function sendMessageToUi(message: MessageType) {
  await Promise.allSettled([sendMessage(message)])
}

export async function sendMessageToActiveTabsAndUi(message: MessageType) {
  await sendMessageToUi(message)
  await sendMessageToActiveTabs(message)
}
