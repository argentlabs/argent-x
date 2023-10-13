import browser from "webextension-polyfill"

import { MessageType, sendMessage } from "../shared/messages"
import { UniqueSet } from "./utils/uniqueSet"

interface Tab {
  id: number
  host: string
  port: browser.runtime.Port
}

// do not store the port in any storage, like ArrayStorage.
// it is not serializable and will cause errors
// ports also get closed when the background worker is reloaded, and they should automatically reconnect
const activeTabs = new UniqueSet<Tab, number>((t) => t.id)

browser.tabs.onRemoved.addListener(removeTab)

export async function addTab(tab: Tab) {
  if (tab.id !== undefined) {
    return activeTabs.add(tab)
  }
}

export function removeTab(tabId?: number) {
  if (tabId === undefined) {
    return false
  }
  return activeTabs.delete(tabId)
}

export async function hasTab(tabId?: number) {
  if (tabId === undefined) {
    return false
  }
  return activeTabs.has(tabId)
}

async function getTabsOfHost(host: string) {
  const allTabs = activeTabs.getAll()
  const hits = allTabs.filter((tab) => tab.host === host)
  return hits
}

export async function sendMessageToHost(
  message: MessageType,
  host: string,
): Promise<void> {
  const tabs = await getTabsOfHost(host)

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
  const tabs = activeTabs.getAll()

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
