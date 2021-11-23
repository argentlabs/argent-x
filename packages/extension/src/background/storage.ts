import browser from "webextension-polyfill"

export async function getFromStorage<T extends any, K extends string = string>(
  key: K,
): Promise<T | null> {
  try {
    return JSON.parse((await browser.storage.local.get(key))[key]) ?? null
  } catch (e) {
    return null
  }
}

export function setToStorage(key: string, value: any) {
  return browser.storage.local.set({ [key]: JSON.stringify(value) })
}

export class Storage<T extends Record<string, any>> {
  private NS: string
  public defaults: Partial<T>
  constructor(defaults: Partial<T> = {}, namespace: string = "") {
    this.NS = namespace
    this.defaults = defaults
  }
  async getItem<K extends keyof T>(key: K): Promise<T[K] | null> {
    return (
      (await getFromStorage<T[K]>(this.NS + ":" + key.toString())) ??
      this.defaults[key] ??
      null
    )
  }
  async setItem<K extends keyof T>(key: K, value: T[K]): Promise<void> {
    return setToStorage(this.NS + ":" + key.toString(), value)
  }
}
