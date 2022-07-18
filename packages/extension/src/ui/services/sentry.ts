import * as Sentry from "@sentry/react"
import { useEffect } from "react"

import { ISettingsStorage } from "../../shared/settings"
import { useBackgroundSettingsValue } from "./useBackgroundSettingsValue"

export const useSentryInit = () => {
  const { value: automaticErrorReporting } = useBackgroundSettingsValue<
    ISettingsStorage["privacyErrorReporting"]
  >("privacyShareAnalyticsData")

  useEffect(() => {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      debug: process.env.NODE_ENV === "development",
      environment: process.env.NODE_ENV,
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
