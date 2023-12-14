import { isArray } from "lodash-es"
import {
  ARGENT_API_BASE_URL,
  ARGENT_EXPLORER_BASE_URL,
} from "../../api/constants"
import { Transaction, getInFlightTransactions } from "../../transactions"

export interface IMinimalStorage
  extends Pick<Storage, "setItem" | "getItem" | "removeItem"> {}

export type PruneFn = (value: string) => string

export type Pattern = RegExp | [RegExp, PruneFn]

/** prune anything which can be retrieved again on-demand */

const localStoragePatterns: Pattern[] = [
  new RegExp(`${ARGENT_API_BASE_URL}`, "i"),
  new RegExp(`${ARGENT_EXPLORER_BASE_URL}`, "i"),
  /"useTransactionReviewV2"/,
  /"simulateAndReview"/,
  /"maxEthTransferEstimate"/,
  /"accountDeploymentFeeEstimation"/,
  /"nonce"/,
  /"fee"/,
  /"balanceOf"/,
  /"accountTokenBalances"/,
  /"feeTokenBalance"/,
  [/^core:transactions$/, pruneTransactions],
  /^dev:storage/,
]

/** keep in-flight transactions as they can't be retreived from backend or on-chain */

export function pruneTransactions(value: string) {
  try {
    const transactions: Transaction[] = JSON.parse(value)
    const prunedTransactions = getInFlightTransactions(transactions)
    return JSON.stringify(prunedTransactions)
  } catch (e) {
    // ignore parsing error
  }
  return value
}

export function copyStorageToObject(storage: IMinimalStorage = localStorage) {
  const object: Record<string, string> = {}
  for (const key of Object.keys(storage)) {
    const value = storage.getItem(key)
    if (value !== null) {
      object[key] = value
    }
  }
  return object
}

export function copyObjectToStorage(
  object: Record<string, string>,
  storage: IMinimalStorage = localStorage,
) {
  for (const key of Object.keys(storage)) {
    storage.removeItem(key)
  }
  for (const key in object) {
    const value = object[key]
    storage.setItem(key, value)
  }
}

export function pruneStorageData(
  storage: IMinimalStorage = localStorage,
  patterns: Pattern[] = localStoragePatterns,
) {
  for (const key of Object.keys(storage)) {
    const matches = patterns.some((pattern) => {
      if (isArray(pattern)) {
        const [regexp, pruneFn] = pattern
        if (regexp.test(key)) {
          const value = storage.getItem(key)
          if (value !== null) {
            storage.setItem(key, pruneFn(value))
            return false
          }
        }
        return false
      }
      return pattern.test(key)
    })
    if (matches) {
      storage.removeItem(key)
    }
  }
}

export function isQuotaExceededError(e: unknown) {
  return e instanceof DOMException && e.name === "QuotaExceededError"
}

/** strategy - tries to store value, on quota error prunes storage and then tries again - avoids expensive storage size checks */

export function setItemWithStorageQuotaExceededStrategy(
  key: string,
  value: string,
  storage: IMinimalStorage = localStorage,
  patterns: Pattern[] = localStoragePatterns,
) {
  /** quota sizes vary - try to set the item and catch quota error */
  try {
    return storage.setItem(key, value)
  } catch (e) {
    /** only continue if quota was exceeded */
    if (!isQuotaExceededError(e)) {
      throw e
    }
  }
  /** if there is a further error pruning or storing, revert to snapshot */
  const snapshot = copyStorageToObject(storage)
  try {
    /** prune data and try again */
    pruneStorageData(storage, patterns)
    return storage.setItem(key, value)
  } catch (e) {
    /** TODO: could potentially further check for quota error here and try pruning matching key and value, then setting pruned value */
    /** revert storage to original snapshot */
    copyObjectToStorage(snapshot, storage)
    throw e
  }
}

export function getStorageUsedBytes(storage: Storage = localStorage) {
  let usedBytes = 0
  for (const key of Object.keys(storage)) {
    usedBytes += new Blob([storage[key]]).size
  }
  return usedBytes
}
