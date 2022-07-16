import browser from "webextension-polyfill"

import { ArrayStorage } from "../storage"
import { ExtensionActionItem } from "./types"

export const globalActionQueueStore = new ArrayStorage<ExtensionActionItem>(
  [],
  {
    namespace: "core:actionQueue",
    areaName: "local",
    compare: (a, b) => a.meta.hash === b.meta.hash,
  },
)

const showNotificationBadge = (actions: ExtensionActionItem[]) => {
  browser.browserAction.setBadgeText({
    text: `${actions.length || ""}`, // 0 should not show a badge
  })

  browser.browserAction.setBadgeBackgroundColor({ color: "#29C5FF" })
}

globalActionQueueStore.subscribe((all) => {
  showNotificationBadge(all)
})
