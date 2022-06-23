import { SettingsMessage } from "../shared/messages/SettingsMessage"
import { UnhandledMessage } from "./background"
import { HandleMessage } from "./background"
import { settingsStorage } from "./storage/settings"

export const handleSettingsMessage: HandleMessage<SettingsMessage> = async ({
  msg,
  background: _,
  sendToTabAndUi,
}) => {
  switch (msg.type) {
    case "GET_SETTING": {
      const { key } = msg.data
      const value = await settingsStorage.getItem(key)
      return sendToTabAndUi({
        type: "GET_SETTING_RES",
        data: value,
      })
    }

    case "SET_SETTING": {
      const { key, value } = msg.data
      await settingsStorage.setItem(key, value)
      sendToTabAndUi({
        type: "SET_SETTING_RES",
        data: value,
      })
      return sendToTabAndUi({
        type: "SETTING_CHANGED",
        data: {
          key,
          value,
        },
      })
    }

    case "REMOVE_SETTING": {
      const { key } = msg.data
      await settingsStorage.removeItem(key)
      sendToTabAndUi({
        type: "REMOVE_SETTING_RES",
      })
      return sendToTabAndUi({
        type: "SETTING_CHANGED",
        data: {
          key,
          value: undefined,
        },
      })
    }
  }

  throw new UnhandledMessage()
}
