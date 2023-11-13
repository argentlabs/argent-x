import { DeepPick } from "../shared/types/deepPick"

export type MinimalActionBrowser = DeepPick<
  typeof chrome,
  "action" | "browserAction" | "runtime.getManifest"
>

export function getBrowserAction(browser: MinimalActionBrowser) {
  return browser.runtime.getManifest().manifest_version === 2
    ? browser.browserAction
    : browser.action
}
