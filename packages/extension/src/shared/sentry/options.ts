import * as Sentry from "@sentry/browser"

const environment = process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV

const release = getRelease()

export const baseSentryOptions: Sentry.BrowserOptions = {
  dsn: process.env.SENTRY_DSN,
  environment,
  release,
  autoSessionTracking: false, // don't want to track user sessions.
}

function getRelease() {
  const commitHash = process.env.COMMIT_HASH
  const release = process.env.npm_package_version
  if (environment === "staging" && commitHash) {
    return `${release}-rc__${commitHash}`
  }
  return release
}
