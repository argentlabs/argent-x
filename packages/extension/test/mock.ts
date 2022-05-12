import { IStorage } from "../src/background/storage"

export class MockStorage<T extends Record<string, any> = Record<string, any>>
  implements IStorage<T>
{
  public store: T
  constructor(store: T = {} as T) {
    this.store = store
  }

  async getItem<K extends keyof T>(key: K): Promise<T[K]> {
    return Promise.resolve(this.store[key])
  }
  async setItem<K extends keyof T>(key: K, value: T[K]): Promise<void> {
    this.store[key] = value
  }
}
