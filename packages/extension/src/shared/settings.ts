export interface ISettingsStorage {
  privacyUseArgentServices: boolean
  privacyShareAnalyticsData: boolean
  privacyErrorReporting: boolean
}

export const defaultSettings: ISettingsStorage = {
  privacyUseArgentServices: true,
  privacyShareAnalyticsData: true,
  privacyErrorReporting: false,
}

export type SettingsStorageKey = keyof ISettingsStorage

export type SettingsStorageValue = ISettingsStorage[SettingsStorageKey]

export const isPrivacySettingsEnabled = true
// (process.env.FEATURE_PRIVACY_SETTINGS || "false") === "true"
