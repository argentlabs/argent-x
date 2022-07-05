import { useEffect, useState } from "react"

import { ObjectStorage } from "./object"

// export function useStorage<T, S extends IStorage<T>, K extends keyof T>(
//   storage: S,
//   key: K,
// ): T[keyof T] {
//   const [value, setValue] = useState<T[K]>(storage.defaults[key])

//   useEffect(() => {
//     storage.getItem(key).then(setValue)
//     const sub = storage.subscribe(key, setValue)
//     return () => sub()
//   }, [storage, key])

//   return value
// }

export function useObjectStorage<T>(storage: ObjectStorage<T>): T {
  const [value, setValue] = useState<T>(storage.defaults)

  useEffect(() => {
    storage.get().then(setValue)
    const sub = storage.subscribe(setValue)
    return () => sub()
  }, [])

  return value
}
