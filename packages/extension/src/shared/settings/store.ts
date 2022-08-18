import { KeyValueStorage } from "../storage"
import { ISettingsStorage } from "./types"

export const settingsStore = new KeyValueStorage<ISettingsStorage>(
  {
    privacyUseArgentServices: true,
    privacyShareAnalyticsData: true,
    privacyErrorReporting: Boolean(process.env.SENTRY_DSN), // use SENRY_DSN to enable error reporting
    privacyAutomaticErrorReporting: false,
  },
  "core:settings",
)
