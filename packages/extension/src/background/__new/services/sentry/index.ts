import { baseSentryOptions } from "../../../../shared/sentry/options"
import { settingsStore } from "../../../../shared/settings"
import { SentryWorker } from "./worker"

export const sentryWorker = new SentryWorker(baseSentryOptions, settingsStore)
