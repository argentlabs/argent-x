import { ISettingsStorage } from "../../shared/settings"
import { Storage } from "."

export const defaultSettings: ISettingsStorage = {
  privacyUseArgentServices: true,
  privacyShareAnalyticsData: true,
}

export const settingsStorage = new Storage<ISettingsStorage>(
  defaultSettings,
  "settings",
)
