import { useCallback, useEffect, useState } from "react"
import useSWR from "swr"
import browser from "webextension-polyfill"

import {
  getStorageUsedBytes,
  pruneStorageData,
} from "../../../shared/storage/__new/prune"

/** provides ways of stressing storage for manual testing im `dev:ui` */

const longString = Array(1024).join("0")

function generateLargeObject(targetSizeInBytes: number): any {
  const object = []
  let len = 0
  while (len < targetSizeInBytes) {
    object.push(longString)
    len += longString.length
  }
  return object
}

const object1Mb = generateLargeObject(1 * 1024 * 1024)
const object4Mb = generateLargeObject(4 * 1024 * 1024)

export const useDevStorageUI = () => {
  const [localStorageUsed, setLocalStorageUsed] = useState(
    getStorageUsedBytes(),
  )
  const [storageUsed, setStorageUsed] = useState(0)
  const { data: data1Mb = [], mutate: mutate1Mb } = useSWR("dev:storage:1mb")
  const { mutate: mutate4Mb } = useSWR("dev:storage:4mb")

  const updateStorageUsed = useCallback(async () => {
    setLocalStorageUsed(getStorageUsedBytes())
    const bytes = await browser.storage.local.getBytesInUse()
    setStorageUsed(bytes)
  }, [])

  const incrementStorage1Mb = useCallback(async () => {
    await mutate1Mb(data1Mb.concat(object1Mb))
    const current = await browser.storage.local.get("dev:storage:1mb")
    await browser.storage.local.set({
      "dev:storage:1mb": current["dev:storage:1mb"].concat(object1Mb),
    })
    // Error: QUOTA_BYTES quota exceeded without "unlimitedStorage" in manifest
    await updateStorageUsed()
  }, [mutate1Mb, data1Mb, updateStorageUsed])

  const setStorage4Mb = useCallback(async () => {
    await mutate4Mb(object4Mb)
    await updateStorageUsed()
  }, [updateStorageUsed, mutate4Mb])

  const pruneStorage = useCallback(async () => {
    pruneStorageData()
    await browser.storage.local.set({
      "dev:storage:1mb": [],
    })
    await updateStorageUsed()
  }, [updateStorageUsed])

  useEffect(() => {
    /** can listen for `browser.storage` but can't listen for `localStorage` storage change in same window as the change is made */
    browser.storage.local.onChanged.addListener(updateStorageUsed)
    void updateStorageUsed()
    return () =>
      browser.storage.local.onChanged.removeListener(updateStorageUsed)
  }, [updateStorageUsed])

  const prettyStorageUsed = `${(localStorageUsed / (1024 * 1024)).toFixed(
    2,
  )}Mb, ${(storageUsed / (1024 * 1024)).toFixed(2)}Mb (storage.local)`

  return {
    incrementStorage1Mb,
    setStorage4Mb,
    pruneStorage,
    prettyStorageUsed,
    updateStorageUsed,
  }
}
