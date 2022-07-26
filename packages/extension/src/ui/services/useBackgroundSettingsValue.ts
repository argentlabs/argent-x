import { useCallback, useEffect, useState } from "react"

import { messageStream } from "../../shared/messages"
import { ISettingsStorage } from "../../shared/settings"
import { getSetting, removeSetting, setSetting } from "./backgroundSettings"

/**
 * Hook providing access to an indiviudal value from background settings
 *
 * @param key the key of the value to use
 */

export const useBackgroundSettingsValue = (key: keyof ISettingsStorage) => {
  const [initialised, setInitialised] = useState<boolean>(false)
  const [storedValue, setStoredValue] = useState<any>(null)

  /** read the value async from storage then update in hook state */
  const updateStoredValue = useCallback(async () => {
    const value = await getSetting(key as keyof ISettingsStorage)
    setStoredValue(value)
    if (!initialised) {
      setInitialised(true)
    }
    // dont rerun when initialised changes, as it would cause an infinite loop
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  const setValue = useCallback(
    async (value: any) => {
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
