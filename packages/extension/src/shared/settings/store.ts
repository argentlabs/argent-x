import { KeyValueStorage } from "../storage"
import { defaultAutoLockTimeMinutes } from "./defaultAutoLockTimes"
import { defaultBlockExplorerKey } from "./defaultBlockExplorers"
import type { ISettingsStorage } from "./types"

export const settingsStore = new KeyValueStorage<ISettingsStorage>(
  {
    privacyUseArgentServices: true,
    privacyShareAnalyticsData: true,
    privacyErrorReporting: Boolean(process.env.SENTRY_DSN), // use SENRY_DSN to enable error reporting
    privacyAutomaticErrorReporting: true,
    experimentalAllowChooseAccount: false,
    blockExplorerKey: defaultBlockExplorerKey,
    nftMarketplaceKey: "unframed",
    autoLockTimeMinutes: defaultAutoLockTimeMinutes,
    disableAnimation: false,
    hideSpamTokens: true,
    airGapEnabled: false,
  },
  "core:settings",
)
