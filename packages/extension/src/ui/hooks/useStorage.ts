import memoize from "memoizee"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { swrCacheProvider } from "../services/swr.service"
import type { IArrayStorage } from "../../shared/storage/array"
import type { IKeyValueStorage } from "../../shared/storage/keyvalue"
import type { IObjectStorage } from "../../shared/storage/object"
import type { SelectorFn } from "../../shared/storage/types"

export function useGetSetKeyValueStorage<
  T extends Record<string, any> = Record<string, any>,
  K extends keyof T = keyof T,
>(storage: IKeyValueStorage<T>, key: K): [T[K], (value: T[K]) => void] {
  const value = useKeyValueStorage(storage, key)
  const setValue = useCallback(
    (value: T[K]) => {
      void storage.set(key, value)
    },
    [storage, key],
  )
  return [value, setValue]
}

export function useKeyValueStorage<
  T extends Record<string, any> = Record<string, any>,
  K extends keyof T = keyof T,
>(storage: IKeyValueStorage<T>, key: K): T[K] {
  const [value, setValue] = useState<T[K]>(
    swrCacheProvider.get(storage.namespace + ":" + key.toString()) ??
      storage.defaults[key],
  )

  const set = useCallback(
    (value: T[K]) => {
      swrCacheProvider.set(storage.namespace + ":" + key.toString(), value)
      setValue(value)
    },
    [key, storage.namespace],
  )

  useEffect(() => {
    void storage.get(key).then(set)
    const sub = storage.subscribe(key, set)
    return () => sub()
  }, [storage, key, set])

  return value
}

export function useObjectStorage<T>(storage: IObjectStorage<T>): T {
  const [value, setValue] = useState<T>(
    swrCacheProvider.get(storage.namespace) ?? storage.defaults,
  )

  const set = useCallback(
    (value: T) => {
      swrCacheProvider.set(storage.namespace, value)
      setValue(value)
    },
    [storage.namespace],
  )

  useEffect(() => {
    void storage.get().then(set)
    const sub = storage.subscribe(set)
    return () => sub()
  }, [set, storage])

  return value
}

const defaultSelector = memoize(() => true, { normalizer: () => "default" })

export function useArrayStorage<T>(
  storage: IArrayStorage<T>,
  selector: SelectorFn<T> = defaultSelector,
): T[] {
  const [value, setValue] = useState<T[]>(
    swrCacheProvider.get(storage.namespace) ?? storage.defaults,
  )

  const set = useCallback(
    (value: T[]) => {
      swrCacheProvider.set(storage.namespace, value)
      setValue(value)
    },
    [storage.namespace],
  )

  const selectorRef = useRef(selector)

  useEffect(() => {
    selectorRef.current = selector
  }, [selector])

  useEffect(() => {
    void storage.get().then(set)
    const sub = storage.subscribe(set)
    return () => sub()
  }, [storage, set])

  const filteredValue = useMemo(
    () => value.filter((item) => selectorRef.current(item)),
    [value],
  )

  return filteredValue
}
