import * as Sentry from "@sentry/react"
import { useEffect } from "react"

import { settingsStore } from "../../shared/settings"
import { useKeyValueStorage } from "../hooks/useStorage"
import { baseSentryOptions } from "../../shared/sentry/options"

export const useSentryInit = () => {
  const privacyErrorReporting = useKeyValueStorage(
    settingsStore,
    "privacyErrorReporting",
  )
  const privacyAutomaticErrorReporting = useKeyValueStorage(
    settingsStore,
    "privacyAutomaticErrorReporting",
  )

  useEffect(() => {
    Sentry.init({
      ...baseSentryOptions,
      enabled: privacyErrorReporting,
      beforeSend(event) {
        if (privacyAutomaticErrorReporting) {
          return event
        }
        if (event.extra?.submittedManually) {
          return event
        }
        return null
      },
    })
  }, [privacyAutomaticErrorReporting, privacyErrorReporting])
}
