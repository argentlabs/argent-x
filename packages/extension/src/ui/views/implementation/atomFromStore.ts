import { Atom, atom } from "jotai"

import type { IObjectStore } from "../../../shared/storage/__new/interface"

export const atomFromStore = <T>(repo: IObjectStore<T>): Atom<Promise<T>> => {
  const storageAtom = atom<T | null>(null)
  const promiseAtom = atom<Promise<T>, [T], void>(
    async (get) => {
      const storage = get(storageAtom)

      if (storage) {
        return storage
      }

      const initial = await repo.get()

      return initial
    },
    (_, set, value) => {
      console.log("set storageAtom", value)
      set(storageAtom, value)
    },
  )

  promiseAtom.onMount = (setAtom) => {
    const unsubscribe = repo.subscribe(async () => {
      const newState = await repo.get()
      console.log("repo.subscribe", newState)
      setAtom(newState)
    })

    return unsubscribe
  }

  return promiseAtom
}
