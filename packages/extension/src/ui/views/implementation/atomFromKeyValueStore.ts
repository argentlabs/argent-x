import type { IKeyValueStorage } from "../../../shared/storage"
import { atomWithSubscription } from "./atomWithSubscription"

export const atomFromKeyValueStore = <
  T extends Record<string, any>,
  K extends keyof T,
>(
  store: IKeyValueStorage<T>,
  key: K,
) => {
  return atomWithSubscription(
    () => store.get(key),
    // storage.get can be either a Promise or a direct value,
    // wrap the value in Promise.resolve() to handle both cases
    (next) =>
      store.subscribe(key, () => Promise.resolve(store.get(key)).then(next)),
  )
}
