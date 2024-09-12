import browser from "webextension-polyfill"

import UIService from "./UIService"

export const uiService = new UIService(browser)
