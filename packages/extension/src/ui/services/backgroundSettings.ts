import { sendMessage, waitForMessage } from "../../shared/messages"
import { SettingsStorageKey } from "../../shared/settings"

export const getSetting = async (key: SettingsStorageKey) => {
  await sendMessage({ type: "GET_SETTING", data: { key } })
  const { value } = await waitForMessage("GET_SETTING_RES", ({ data }) => {
    return data.key === key
  })
  return value
}

export const setSetting = async (key: SettingsStorageKey, value: any) => {
  sendMessage({ type: "SET_SETTING", data: { key, value } })
  return waitForMessage("SET_SETTING_RES")
}

export const removeSetting = async (key: SettingsStorageKey) => {
  sendMessage({ type: "REMOVE_SETTING", data: { key } })
  return waitForMessage("REMOVE_SETTING_RES")
}
