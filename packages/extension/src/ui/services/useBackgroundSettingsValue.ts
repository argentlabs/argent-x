import { isUndefined } from "lodash-es"
import { useCallback, useEffect, useState } from "react"

import { SettingsStorageKey } from "./../../shared/settings/types"
import {
  SettingsStorageValue,
  getSetting,
  setSetting,
  subscribeToSettings,
} from "../../shared/settings"

/**
 * Hook providing access to an indiviudal value from background settings
 *
 * @param key the key of the value to use
 */

export const useBackgroundSettingsValue = <K extends SettingsStorageKey>(
  key: K,
) => {
  const [initialised, setInitialised] = useState<boolean>(false)
  const [storedValue, setStoredValue] = useState<SettingsStorageValue<K>>()

  /** read the value async from storage then update in hook state */
  const updateStoredValue = useCallback(async () => {
    const value = await getSetting(key)
    setStoredValue(value)
    if (!initialised) {
      setInitialised(true)
    }
    // dont rerun when initialised changes, as it would cause an infinite loop
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  const setValue = useCallback(
    async (value: SettingsStorageValue<K>) => {
      await setSetting(key, value)
    },
    [key],
  )

  /** subscribe to change message to update the local hook state */
  useEffect(() => {
    if (isUndefined(storedValue)) {
      updateStoredValue()
    } else {
      subscribeToSettings(updateStoredValue)
    }
  }, [key, storedValue, updateStoredValue])

  return {
    initialised,
    value: storedValue,
    setValue,
  }
}
