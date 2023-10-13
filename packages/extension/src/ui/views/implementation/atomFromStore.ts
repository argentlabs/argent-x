import type { IObjectStore } from "../../../shared/storage/__new/interface"
import { atomWithSubscription } from "./atomWithSubscription"

export const atomFromStore = <T>(repo: IObjectStore<T>) => {
  return atomWithSubscription(
    () => repo.get(),
    (next) => repo.subscribe(() => repo.get().then(next)),
  )
}
