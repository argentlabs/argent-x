export interface ISettingsStorage {
  privacyUseArgentServices: boolean
  privacyShareAnalyticsData: boolean
}

export type SettingsStorageKey = keyof ISettingsStorage
