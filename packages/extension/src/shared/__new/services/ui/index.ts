import browser from "webextension-polyfill"

import UIService from "./implementation"

export const uiService = new UIService(browser)
