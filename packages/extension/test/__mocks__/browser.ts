import { isArray } from "lodash-es"

const browserStorageLocalMock = new Map()

/** mock for `browser.storage.local` */
const browserMock = {
  storage: {
    local: {
      get: async (keys?: null | string | string[]) => {
        if (keys === null) {
          keys = Object.keys(browserStorageLocalMock)
        } else if (typeof keys === "string") {
          keys = [keys]
        }
        if (!isArray(keys)) {
          return
        }
        if (!keys) {
          return
        }
        const result: Record<string, any> = {}
        keys.forEach((key) => {
          const value = browserStorageLocalMock.get(key)
          result[key] = value
        })
        return result
      },
      set: async (items: Record<string, any>) => {
        Object.keys(items).forEach((key) => {
          const value = items[key]
          browserStorageLocalMock.set(key, value)
        })
      },
      remove: async (keys: string | string[]) => {
        if (typeof keys === "string") {
          keys = [keys]
        }
        if (!isArray(keys)) {
          return
        }
        keys.forEach((key) => {
          browserStorageLocalMock.delete(key)
        })
      },
      clear: async () => {
        browserStorageLocalMock.clear()
      },
    },
  },
}

export default browserMock
