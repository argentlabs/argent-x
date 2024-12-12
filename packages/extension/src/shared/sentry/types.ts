import type { BrowserClient } from "@sentry/browser"

/** type not exported by Sentry */
export type BrowserClientOptions = ConstructorParameters<
  typeof BrowserClient
>[0]

export type BrowserExtensionSentryInit = (
  options: BrowserClientOptions,
) => BrowserClient
