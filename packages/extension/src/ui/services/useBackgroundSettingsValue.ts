import { useCallback, useEffect, useState } from "react"

import { messageStream } from "../../shared/messages"
import { ISettingsStorage, SettingsStorageValue } from "../../shared/settings"
import { getSetting, removeSetting, setSetting } from "./backgroundSettings"

/**
 * Hook providing access to an indiviudal value from background settings
 *
 * @param key the key of the value to use
 */

export const useBackgroundSettingsValue = <T extends SettingsStorageValue>(
  key: keyof ISettingsStorage,
) => {
  const [initialised, setInitialised] = useState<boolean>(false)
  const [storedValue, setStoredValue] = useState<T>()

  /** read the value async from storage then update in hook state */
  const updateStoredValue = useCallback(async () => {
    const value = (await getSetting(key as keyof ISettingsStorage)) as T
    setStoredValue(value)
    if (!initialised) {
      setInitialised(true)
    }
  }, [initialised, key])

  const setValue = useCallback(
    async (value: T) => {
      await setSetting(key, value)
    },
    [key],
  )

  const removeValue = useCallback(async () => {
    await removeSetting(key)
  }, [key])

  /** subscribe to change message to update the local hook state */
  useEffect(() => {
    const subscription = messageStream.subscribe(([message]) => {
      if (message.type === "SETTING_CHANGED" && message.data.key === key) {
        updateStoredValue()
      }
    })
    updateStoredValue()
    return () => {
      if (!subscription.closed) {
        subscription.unsubscribe()
      }
    }
  }, [key, updateStoredValue])

  return {
    initialised,
    value: storedValue,
    setValue,
    removeValue,
  }
}
