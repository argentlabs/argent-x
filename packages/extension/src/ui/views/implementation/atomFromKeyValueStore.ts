import { IKeyValueStorage } from "../../../shared/storage"
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
    (next) => store.subscribe(key, () => store.get(key).then(next)),
  )
}
