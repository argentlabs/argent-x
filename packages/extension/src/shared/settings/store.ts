import { KeyValueStorage } from "../storage"
import { defaultBlockExplorerKey } from "./defaultBlockExplorers"
import { ISettingsStorage } from "./types"

export const settingsStore = new KeyValueStorage<ISettingsStorage>(
  {
    privacyUseArgentServices: true,
    privacyShareAnalyticsData: true,
    privacyErrorReporting: Boolean(process.env.SENTRY_DSN), // use SENRY_DSN to enable error reporting
    privacyAutomaticErrorReporting: false,
    experimentalPluginAccount: false, // Used experimental as namespace for now. Should be changed in future according to the place of the setting.
    blockExplorerKey: defaultBlockExplorerKey,
  },
  "core:settings",
)
