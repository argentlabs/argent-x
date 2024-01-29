import * as Sentry from "@sentry/react"
import { useEffect } from "react"

import { settingsStore } from "../../shared/settings"
import { useKeyValueStorage } from "../hooks/useStorage"

export const useSentryInit = () => {
  const enableErrorReporting = useKeyValueStorage(
    settingsStore,
    "privacyErrorReporting",
  )
  const automaticErrorReporting = useKeyValueStorage(
    settingsStore,
    "privacyAutomaticErrorReporting",
  )

  const environment = process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV

  let release = process.env.npm_package_version
  const commitHash = process.env.COMMIT_HASH

  if (environment === "staging" && commitHash) {
    release = `${release}-rc__${commitHash}`
  }

  useEffect(() => {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment,
      release,
      autoSessionTracking: false, // don't want to track user sessions.
      enabled: enableErrorReporting,
      beforeSend(event) {
        if (automaticErrorReporting) {
          return event
        }
        if (event.extra?.submittedManually) {
          return event
        }
        return null
      },
    })
  }, [automaticErrorReporting, enableErrorReporting, environment, release])
}
