import { MinimalActionBrowser, getBrowserAction } from "../browser"
import { DeepPick } from "../types/deepPick"
import { UI_SERVICE_CONNECT_ID } from "./constants"
import { IUIService } from "./IUIService"

type MinimalBrowser = DeepPick<
  typeof chrome,
  | "extension.getViews"
  | "runtime.getURL"
  | "tabs.create"
  | "tabs.query"
  | "tabs.update"
  | "windows.update"
  | "windows.remove"
  | "windows.getAll"
> &
  MinimalActionBrowser

export default class UIService implements IUIService {
  constructor(
    private browser: MinimalBrowser,
    readonly connectId = UI_SERVICE_CONNECT_ID,
  ) {}

  setDefaultPopup(popup = "index.html") {
    return getBrowserAction(this.browser).setPopup({ popup })
  }

  unsetDefaultPopup() {
    return this.setDefaultPopup("")
  }

  async createTab(path = "index.html") {
    const url = this.browser.runtime.getURL(path)
    return this.browser.tabs.create({ url })
  }

  async getTab() {
    const [tab] = await this.browser.tabs.query({
      url: [this.browser.runtime.getURL("/*")],
    })
    return tab
  }

  async hasTab() {
    const tab = await this.getTab()
    return Boolean(tab && tab.id && tab.windowId)
  }

  async focusTab() {
    const tab = await this.getTab()
    if (tab && tab.id && tab.windowId) {
      await this.browser.windows.update(tab.windowId, {
        focused: true,
      })
      await this.browser.tabs.update(tab.id, {
        active: true,
      })
    }
  }

  async getFloatingWindow() {
    const [floatingWindow] = await this.browser.windows.getAll({
      windowTypes: ["popup"],
    })
    return floatingWindow
  }

  async hasFloatingWindow() {
    const floatingWindow = await this.getFloatingWindow()
    return Boolean(floatingWindow)
  }

  async focusFloatingWindow() {
    const floatingWindow = await this.getFloatingWindow()
    if (floatingWindow && floatingWindow.id) {
      await this.browser.windows.update(floatingWindow.id, {
        focused: true,
      })
    }
  }

  async closeFloatingWindow() {
    const floatingWindow = await this.getFloatingWindow()
    if (floatingWindow?.id) {
      await this.browser.windows.remove(floatingWindow.id)
    }
  }
}
