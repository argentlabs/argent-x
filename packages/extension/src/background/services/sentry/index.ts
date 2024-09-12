import { baseSentryOptions } from "../../../shared/sentry/option"
import { browserExtensionSentryInit } from "../../../shared/sentry/scope"
import { settingsStore } from "../../../shared/settings"
import { SentryWorker } from "./SentryWorker"

export const sentryWorker = new SentryWorker(
  browserExtensionSentryInit,
  baseSentryOptions,
  settingsStore,
)
