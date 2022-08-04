import { KeyValueStorage } from "../storage"
import { ISettingsStorage } from "./types"

export const settingsStore = new KeyValueStorage<ISettingsStorage>(
  {
    privacyUseArgentServices: false,
    privacyShareAnalyticsData: false,
    privacyErrorReporting: false,
  },
  "core:settings",
)
