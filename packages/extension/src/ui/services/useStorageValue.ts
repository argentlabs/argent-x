import { useCallback, useEffect, useMemo, useState } from "react"
import browser from "webextension-polyfill"

import { Storage } from "../../background/storage"

/**
 * Hook providing access to an indiviudal value from shared local storage implemented using the Storage class
 *
 * @param key the key of the value to use
 * @param settingsStorageImpl the Storage implementation that stores the values
 * @returns
 */

function useStorageValue<T>(key: keyof T, settingsStorageImpl: Storage<T>) {
  const [initialised, setInitialised] = useState<boolean>(false)
  const [storedValue, setStoredValue] = useState<any>(null)
  const storageKey = useMemo(() => {
    return settingsStorageImpl.storageKeyForKey(key)
  }, [key])

  /** read the value async from storage then update in hook state */
  const updateStoredValue = useCallback(async () => {
    const value = await settingsStorageImpl.getItem(key)
    setStoredValue(value)
    if (!initialised) {
      setInitialised(true)
    }
  }, [key])

  const setValue = useCallback(
    async (value: any) => {
      await settingsStorageImpl.setItem(key, value)
    },
    [key],
  )

  const removeValue = useCallback(async () => {
    await settingsStorageImpl.removeItem(key)
  }, [key])

  /** initialise and add event listeners to update the local hook state */
  useEffect(() => {
    const localStorageChange = async (
      changes: Record<string, browser.Storage.StorageChange>,
    ) => {
      const changedKeys = Object.keys(changes)
      const valueDidChange = changedKeys.includes(storageKey)
      if (valueDidChange) {
        updateStoredValue()
      }
    }
    browser.storage.onChanged.addListener(localStorageChange)
    updateStoredValue()
    return () => {
      browser.storage.onChanged.removeListener(localStorageChange)
    }
  }, [updateStoredValue])

  return {
    initialised,
    value: storedValue,
    setValue,
    removeValue,
  }
}

export { useStorageValue }
