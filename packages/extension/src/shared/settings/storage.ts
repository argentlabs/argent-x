import { ObjectStorage } from "../storage"
import { ISettingsStorage } from "./types"

export const defaultSettings: ISettingsStorage = {
  privacyUseArgentServices: true,
  privacyShareAnalyticsData: true,
  privacyErrorReporting: false,
}

export const settingsStorage = new ObjectStorage<ISettingsStorage>(
  defaultSettings,
  "core:settings",
)
