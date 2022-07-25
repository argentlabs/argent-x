import { useCallback, useEffect, useState } from "react"

import {
  ISettingsStorage,
  SettingsStorageKey,
} from "./../../shared/settings/types"
import {
  SettingsStorageValue,
  setSetting,
  settingsStorage,
} from "../../shared/settings"
import { useObjectStorage } from "../../shared/storage/hooks"

/**
 * Hook providing access to an indiviudal value from background settings
 *
 * @param key the key of the value to use
 */

export const useBackgroundSettingsValue = <K extends SettingsStorageKey>(
  key: K,
) => {
  const [initialised, setInitialised] = useState<boolean>(false)
  const settingsStore = useObjectStorage<ISettingsStorage>(settingsStorage)

  const setValue = useCallback(
    async (value: SettingsStorageValue<K>) => {
      await setSetting(key, value)
    },
    [key],
  )

  useEffect(() => {
    if (!initialised) {
      setInitialised(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return {
    initialised,
    value: settingsStore[key],
    setValue,
  }
}
