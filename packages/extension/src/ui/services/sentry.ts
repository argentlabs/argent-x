import { useEffect } from "react"
import * as Sentry from "@sentry/react"
import { BrowserTracing } from "@sentry/tracing"

export const useSentryInit = () => {
  useEffect(() => {
    Sentry.init({
      dsn: "https://c2c861914bb2448e873ea3235fe03e5e@o1315819.ingest.sentry.io/6567926",
      debug: true,

      integrations: [new BrowserTracing()],
    })
  }, [])
}
