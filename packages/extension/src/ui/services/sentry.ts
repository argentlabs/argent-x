import * as Sentry from "@sentry/react"
import { useEffect } from "react"

import { settingsStore } from "../../shared/settings"
import { useKeyValueStorage } from "../../shared/storage/hooks"

export const useSentryInit = () => {
  const enableErrorReporting = useKeyValueStorage(
    settingsStore,
    "privacyErrorReporting",
  )
  const automaticErrorReporting = useKeyValueStorage(
    settingsStore,
    "privacyAutomaticErrorReporting",
  )

  useEffect(() => {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
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
  }, [automaticErrorReporting, enableErrorReporting])
}
