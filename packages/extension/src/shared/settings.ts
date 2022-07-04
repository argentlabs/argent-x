export interface ISettingsStorage {
  privacyUseArgentServices: boolean
  privacyShareAnalyticsData: boolean
}

export type SettingsStorageKey = keyof ISettingsStorage

export type SettingsStorageValue = ISettingsStorage[SettingsStorageKey]

export const isPrivacySettingsEnabled =
  (process.env.FEATURE_PRIVACY_SETTINGS || "false") === "true"
