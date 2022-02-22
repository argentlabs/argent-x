import browser from "webextension-polyfill"

import { IStorage } from "./interface"

export async function getFromStorage<T, K extends string = string>(
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

export function removeFromStorage(key: string) {
  return browser.storage.local.remove(key)
}

export function clearStorage() {
  return browser.storage.local.clear()
}

export class Storage<T> implements IStorage<T> {
  private NS: string
  public defaults: T
  constructor(defaults: T, namespace = "") {
    this.NS = namespace
    this.defaults = defaults
  }

  async getItem<K extends keyof T>(key: K): Promise<T[K]> {
    return (
      (await getFromStorage<T[K]>(this.NS + ":" + key.toString())) ??
      this.defaults[key]
    )
  }
  async setItem<K extends keyof T>(key: K, value: T[K]): Promise<void> {
    return setToStorage(this.NS + ":" + key.toString(), value)
  }

  async removeItem<K extends keyof T>(key: K): Promise<void> {
    return removeFromStorage(this.NS + ":" + key.toString())
  }
}
