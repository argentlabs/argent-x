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
      dsn: "https://c2c861914bb2448e873ea3235fe03e5e@o1315819.ingest.sentry.io/6567926",
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
