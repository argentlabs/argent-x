import { KeyValueStorage } from "../storage"
import { ISettingsStorage } from "./types"

export const settingsStore = new KeyValueStorage<ISettingsStorage>(
  {
    privacyUseArgentServices: false,
    privacyShareAnalyticsData: false,
    privacyErrorReporting: false,
    experimentalPluginAccount: false, // Used experimental as namespace for now. Should be changed in future according to the place of the setting.
  },
  "core:settings",
)
