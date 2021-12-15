import { BigNumber } from "ethers"
import { Cache } from "swr"

export const swrCacheProvider: Cache = {
  set: (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value))
  },
  get: (key: string) => {
    const value = localStorage.getItem(key)
    try {
      if (!value) throw Error("no value")
      return (
        JSON.parse(value, (k, v) => {
          if (
            typeof v === "object" &&
            "type" in v &&
            "hex" in v &&
            v.type === "BigNumber"
          ) {
            return BigNumber.from(v.hex)
          }
          return v
        }) ?? undefined
      )
    } catch {
      return undefined
    }
  },
  delete: (key: string) => {
    localStorage.removeItem(key)
  },
}
