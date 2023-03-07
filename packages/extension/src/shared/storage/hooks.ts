import { memoize } from "lodash-es"
import { useCallback, useEffect, useMemo, useState } from "react"

import { swrCacheProvider } from "../../ui/services/swr"
import { IArrayStorage } from "./array"
import { IKeyValueStorage } from "./keyvalue"
import { IObjectStorage } from "./object"
import { SelectorFn } from "./types"

export function useKeyValueStorage<
  T extends Record<string, any> = Record<string, any>,
  K extends keyof T = keyof T,
>(storage: IKeyValueStorage<T>, key: K) {
  const [value, setValue] = useState<T[K]>(
    swrCacheProvider.get(storage.namespace + ":" + key.toString())?.data ??
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
    storage.get(key).then(set)
    const sub = storage.subscribe(key, set)
    return () => sub()
  }, [storage, key, set])

  return value
}

export function useObjectStorage<T>(storage: IObjectStorage<T>): T {
  const storedValue = swrCacheProvider.get(storage.namespace)
  const [value, setValue] = useState<T>(storedValue?.data ?? storage.defaults)

  const set = useCallback(
    (value: T) => {
      swrCacheProvider.set(storage.namespace, { data: value })
      setValue(value)
    },
    [storage.namespace],
  )

  useEffect(() => {
    storage.get().then((value) => set(value))
    const sub = storage.subscribe((value) => set(value))
    return () => sub()
  }, [set, storage])

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
    swrCacheProvider.get(storage.namespace)?.data ?? storage.defaults,
  )

  const set = useCallback(
    (value: T[]) => {
      swrCacheProvider.set(storage.namespace, { data: value })
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
