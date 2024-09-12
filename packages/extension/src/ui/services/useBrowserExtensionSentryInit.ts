import { useEffect } from "react"

import { settingsStore } from "../../shared/settings"
import { useKeyValueStorage } from "../hooks/useStorage"
import { baseSentryOptions } from "../../shared/sentry/option"
import { browserExtensionSentryInit } from "../../shared/sentry/scope"

export const useBrowserExtensionSentryInit = () => {
  const privacyErrorReporting = useKeyValueStorage(
    settingsStore,
    "privacyErrorReporting",
  )
  const privacyAutomaticErrorReporting = useKeyValueStorage(
    settingsStore,
    "privacyAutomaticErrorReporting",
  )

  useEffect(() => {
    browserExtensionSentryInit({
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
