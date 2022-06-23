import { SettingsStorageKey } from "../settings"

export type SettingsMessageDataKey = {
  key: SettingsStorageKey
}

export type SettingsMessageDataKeyValue = {
  key: SettingsStorageKey
  value: any
}

export type SettingsMessage =
  | { type: "GET_SETTING"; data: SettingsMessageDataKey }
  | { type: "GET_SETTING_RES"; data: any }
  | { type: "SET_SETTING"; data: SettingsMessageDataKeyValue }
  | { type: "SET_SETTING_RES"; data: any }
  | { type: "REMOVE_SETTING"; data: SettingsMessageDataKey }
  | { type: "REMOVE_SETTING_RES" }
  | { type: "SETTING_CHANGED"; data: SettingsMessageDataKeyValue }
