import { memoize } from "lodash-es"
import { useCallback, useEffect, useMemo, useState } from "react"

import { IArrayStorage } from "./array"
import { IKeyValueStorage } from "./keyvalue"
import { IObjectStorage } from "./object"
import { SelectorFn } from "./types"

const clientCache = new Map<string, any>()

export function useKeyValueStorage<
  T extends Record<string, any> = Record<string, any>,
  K extends keyof T = keyof T,
>(storage: IKeyValueStorage<T>, key: K): T[K] {
  const [value, setValue] = useState<T[K]>(
    clientCache.get(storage.namespace + ":" + key.toString()) ??
      storage.defaults[key],
  )

  useEffect(() => {
    storage.get(key).then(setValue)
    const sub = storage.subscribe(key, setValue)
    return () => sub()
  }, [storage, key])

  useEffect(() => {
    clientCache.set(storage.namespace + ":" + key.toString(), value)
  }, [value, storage.namespace, key])

  return value
}

export function useObjectStorage<T>(storage: IObjectStorage<T>): T {
  const [value, setValue] = useState<T>(
    clientCache.get(storage.namespace) ?? storage.defaults,
  )

  useEffect(() => {
    storage.get().then(setValue)
    const sub = storage.subscribe(setValue)
    return () => sub()
  }, [storage])

  useEffect(() => {
    clientCache.set(storage.namespace, value)
  }, [value, storage.namespace])

  return value
}

const defaultSelector = memoize(
  () => true,
  () => "default",
)

export function useArrayStorage<T>(
  storage: IArrayStorage<T>,
  selector: SelectorFn<T> = defaultSelector,
): T[] {
  const [value, setValue] = useState<T[]>(
    clientCache.get(storage.namespace) ?? storage.defaults,
  )

  const set = useCallback(
    (value: T[]) => {
      clientCache.set(storage.namespace, value)
      setValue(value)
    },
    [storage.namespace],
  )

  useEffect(() => {
    storage.get().then(set)
    const sub = storage.subscribe(set)
    return () => sub()
  }, [selector, storage, set])

  const filteredValue = useMemo(() => value.filter(selector), [value, selector])

  return filteredValue
}
