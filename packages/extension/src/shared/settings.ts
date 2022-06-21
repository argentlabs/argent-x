import { Storage } from "../background/storage"

export interface ISettingsStorage {
  privacyUseArgentServices: boolean
  privacyShareAnalyticsData: boolean
}

export const defaultSettings: ISettingsStorage = {
  privacyUseArgentServices: true,
  privacyShareAnalyticsData: true,
}

export const settingsStorage = new Storage<ISettingsStorage>(
  defaultSettings,
  "settings",
)

export const privacyUseArgentServices = () =>
  settingsStorage.getItem("privacyUseArgentServices")

export const privacyShareAnalyticsData = () =>
  settingsStorage.getItem("privacyShareAnalyticsData")
