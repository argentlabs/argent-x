import browser from "webextension-polyfill"

export const UI_SERVICE_CONNECT_ID = "argent-x-ui-service-connect"

export const ENABLE_TOKEN_DETAILS = process.env.ENABLE_TOKEN_DETAILS === "true"

export const ENABLE_SIDE_PANEL = Boolean(browser.sidePanel)
