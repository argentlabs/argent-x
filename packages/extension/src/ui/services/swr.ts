import { Cache } from "swr"

import { reviveJsonBigNumber } from "../../shared/json"

export interface SWRConfigCommon {
  suspense?: boolean
  refreshInterval?: number
  errorRetryInterval?: number
}

export const swrCacheProvider: Cache = {
  set: (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value))
  },
  get: (key: string) => {
    const value = localStorage.getItem(key)
    if (!value) {
      return undefined
    }
    try {
      return JSON.parse(value, reviveJsonBigNumber) ?? undefined
    } catch {
      return undefined
    }
  },
  delete: (key: string) => {
    localStorage.removeItem(key)
  },
}
