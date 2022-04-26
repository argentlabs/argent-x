import { BigNumber } from "ethers"
import { Cache } from "swr"

const revive = (key: string, value: any) => {
  if (value?.type === "BigNumber" && "hex" in value) {
    return BigNumber.from(value.hex)
  }
  return value
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
      return JSON.parse(value, revive) ?? undefined
    } catch {
      return undefined
    }
  },
  delete: (key: string) => {
    localStorage.removeItem(key)
  },
}
