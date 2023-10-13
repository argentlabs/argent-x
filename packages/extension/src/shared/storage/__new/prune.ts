import urlJoin from "url-join"
import { ARGENT_API_BASE_URL } from "../../api/constants"

const DEFAULT_THRESHOLD = 0.9 // 90%

const pruneThreshold = DEFAULT_THRESHOLD

const keysToRemoveFirst = [
  // Might be an old key as it does not seem to exist in newer wallets, so we want to remove it first.
  urlJoin(ARGENT_API_BASE_URL, "tokens/info?chain="),
  urlJoin(ARGENT_API_BASE_URL, "tokens/info?chain=starknet"),
] // Add keys you want to prioritize for removal here.

export function pruneData() {
  // Fetch all keys from the local storage.
  const keys = Object.keys(localStorage)

  // Sort keys based on their priority in keysToRemoveFirst.
  keys.sort((a, b) => {
    const indexA = keysToRemoveFirst.indexOf(a)
    const indexB = keysToRemoveFirst.indexOf(b)

    if (indexA !== -1 && indexB === -1) {
      return -1 // a comes before b
    }
    if (indexA === -1 && indexB !== -1) {
      return 1 // b comes before a
    }
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB // sort by their position in keysToRemoveFirst
    }

    // If neither key is in keysToRemoveFirst, keep the original order
    return 0
  })

  // Remove items based on sorted order till storage is below threshold or all items are removed.
  for (const key of keys) {
    localStorage.removeItem(key)
    if (checkIfBelowThreshold()) {
      break
    }
  }
}

const MAX_STORAGE_BYTES = 5 * 1024 * 1024 // 5MB in bytes (what is usually allowed by browsers)

export function checkStorageAndPrune() {
  const isBelowThreshold = checkIfBelowThreshold()

  if (!isBelowThreshold) {
    pruneData()
  }
}

function getTotalUsedBytes() {
  let usedBytes = 0

  for (const key in localStorage) {
    usedBytes += new Blob([localStorage[key]]).size
  }

  return usedBytes
}

function checkIfBelowThreshold() {
  const usedBytes = getTotalUsedBytes()

  return usedBytes / MAX_STORAGE_BYTES <= pruneThreshold
}
