export interface ISettingsStorage {
  privacyUseArgentServices: boolean
  privacyShareAnalyticsData: boolean
  privacyErrorReporting: boolean
}

export type SettingsStorageKey = keyof ISettingsStorage

export type SettingsStorageValue<
  K extends SettingsStorageKey = SettingsStorageKey,
> = ISettingsStorage[K]

export const isPrivacySettingsEnabled = true
