import { ISettingsStorage, settingsStorage } from "../../../shared/settings"
import { useStorageValue } from "../../services/useStorageValue"

export const useSettingsValue = (key: keyof ISettingsStorage) =>
  useStorageValue<ISettingsStorage>(key, settingsStorage)
