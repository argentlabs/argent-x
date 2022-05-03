export interface IStorage<T extends Record<string, any> = Record<string, any>> {
  getItem<K extends keyof T>(key: K): Promise<T[K]>
  setItem<K extends keyof T>(key: K, value: T[K]): Promise<void>
}
