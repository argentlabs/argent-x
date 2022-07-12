import { useEffect, useState } from "react"

import { IArrayStorage } from "./array"
import { IKeyValueStorage } from "./keyvalue"
import { IObjectStorage } from "./object"

export function useKeyValueStorage<
  T extends Record<string, any> = Record<string, any>,
  K extends keyof T = keyof T,
>(storage: IKeyValueStorage<T>, key: K): T[K] {
  const [value, setValue] = useState<T[K]>(storage.defaults[key])

  useEffect(() => {
    storage.getItem(key).then(setValue)
    const sub = storage.subscribe(key, setValue)
    return () => sub()
  }, [storage, key])

  return value
}

export function useObjectStorage<T>(storage: IObjectStorage<T>): T {
  const [value, setValue] = useState<T>(storage.defaults)

  useEffect(() => {
    storage.get().then(setValue)
    const sub = storage.subscribe(setValue)
    return () => sub()
  }, [])

  return value
}

export function useArrayStorage<T>(storage: IArrayStorage<T>): T[] {
  const [value, setValue] = useState<T[]>(storage.defaults)

  useEffect(() => {
    storage.get().then(setValue)
    const sub = storage.subscribe(setValue)
    return () => sub()
  }, [])

  return value
}
