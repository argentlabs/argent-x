import * as Sentry from "@sentry/react"
import { useEffect } from "react"

import { useBackgroundSettingsValue } from "./useBackgroundSettingsValue"

export const useSentryInit = () => {
  const { value: automaticErrorReporting } = useBackgroundSettingsValue(
    "privacyErrorReporting",
  )

  useEffect(() => {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      autoSessionTracking: false, // don't want to track user sessions. Maybe opt-in for future?
      integrations: (integrations) => {
        if (automaticErrorReporting) {
          return integrations
        }

        return integrations.filter(
          (i) => i.name !== "GlobalHandlers" && i.name !== "TryCatch",
        )
      },
    })
  }, [automaticErrorReporting])
}
