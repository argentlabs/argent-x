import { ISettingsStorage, defaultSettings } from "../../shared/settings"
import { Storage } from "."

export const settingsStorage = new Storage<ISettingsStorage>(
  defaultSettings,
  "settings",
)
