export interface ISettingsStorage {
  privacyUseArgentServices: boolean
  privacyShareAnalyticsData: boolean
}

export type SettingsStorageKey = keyof ISettingsStorage

export type SettingsStorageValue = ISettingsStorage[SettingsStorageKey]
