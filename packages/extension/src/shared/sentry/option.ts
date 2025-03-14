import {
  defaultStackParser,
  getDefaultIntegrations,
  makeFetchTransport,
  rewriteFramesIntegration,
} from "@sentry/browser"

import type { BrowserClientOptions } from "./types"
import { stripChromeExtensionPrefix } from "./stripChromeExtensionPrefix"

/**
 * @see https://docs.sentry.io/platforms/javascript/best-practices/shared-environments/
 */
const defaultIntegrations = getDefaultIntegrations({}).filter(
  (defaultIntegration) => {
    return !["BrowserApiErrors", "Breadcrumbs", "GlobalHandlers"].includes(
      defaultIntegration.name,
    )
  },
)

/** Sentry doesn't log the events if they have an extension prefix  */
const stripChromeExtensionIntegration = rewriteFramesIntegration({
  iteratee: (frame) => {
    if (frame.filename) {
      frame.filename = stripChromeExtensionPrefix(frame.filename)
    }
    return frame
  },
})

const integrations = [...defaultIntegrations, stripChromeExtensionIntegration]

const environment = process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV

const release = getRelease()

export const baseSentryOptions: BrowserClientOptions = {
  dsn: process.env.SENTRY_DSN,
  transport: makeFetchTransport,
  stackParser: defaultStackParser,
  integrations,
  environment,
  release,
}

function getRelease() {
  const commitHash = process.env.COMMIT_HASH
  const release = process.env.npm_package_version
  if (environment === "staging" && commitHash) {
    return `${release}-rc__${commitHash}`
  }
  return release
}
