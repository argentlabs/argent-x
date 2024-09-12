/**
 * In a browser extension, should not use Sentry.init(), as this will pollute the global state
 * and the extension may send events to the website's Sentry project, or vice versa
 * @see https://docs.sentry.io/platforms/javascript/best-practices/shared-environments/
 */

import { BrowserClient, Scope } from "@sentry/browser"

import type { BrowserClientOptions, BrowserExtensionSentryInit } from "./types"

export const browserExtensionSentryScope = new Scope()

export const browserExtensionSentryInit: BrowserExtensionSentryInit = (
  options: BrowserClientOptions,
) => {
  const browserExtensionSentryClient = new BrowserClient(options)
  browserExtensionSentryScope.setClient(browserExtensionSentryClient)
  browserExtensionSentryClient.init() // initializing has to be done after setting the client on the scope
  return browserExtensionSentryClient
}

/**
 * Equivalent of Sentry.withScope(...)
 */
export const browserExtensionSentryWithScope = <T>(
  callback: (scope: Scope) => T,
): T => {
  const scope = browserExtensionSentryScope.clone()
  return callback(scope)
}
