import { SettingsStorageKey, SettingsStorageValue } from "../settings"

export type SettingsMessageDataKey = {
  key: SettingsStorageKey
}

export type SettingsMessageDataKeyValue = {
  key: SettingsStorageKey
  value: SettingsStorageValue
}

export type SettingsMessageDataKeyValueRemoved = {
  key: SettingsStorageKey
  value: undefined
}

export type SettingsMessage =
  | { type: "GET_SETTING"; data: SettingsMessageDataKey }
  | { type: "GET_SETTING_RES"; data: SettingsStorageValue }
  | { type: "SET_SETTING"; data: SettingsMessageDataKeyValue }
  | { type: "SET_SETTING_RES"; data: SettingsStorageValue }
  | { type: "REMOVE_SETTING"; data: SettingsMessageDataKey }
  | { type: "REMOVE_SETTING_RES" }
  | {
      type: "SETTING_CHANGED"
      data: SettingsMessageDataKeyValue | SettingsMessageDataKeyValueRemoved
    }
