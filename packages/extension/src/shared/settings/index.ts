import { AllowPromise } from "../storage/types"
import { settingsStorage } from "./storage"
import { SettingsStorageKey, SettingsStorageValue } from "./types"

export const getAllSettings = async () => {
  return await settingsStorage.get()
}

export const getSetting = async <K extends SettingsStorageKey>(
  key: K,
): Promise<SettingsStorageValue<K>> => {
  const allSettings = await getAllSettings()

  return allSettings[key]
}

export const setSetting = async <K extends SettingsStorageKey>(
  key: K,
  value: SettingsStorageValue<K>,
) => {
  return await settingsStorage.set({ [key]: value })
}

export const subscribeToSettings = (callback: () => AllowPromise<void>) => {
  return settingsStorage.subscribe(callback)
}

export * from "./types"
export * from "./storage"
