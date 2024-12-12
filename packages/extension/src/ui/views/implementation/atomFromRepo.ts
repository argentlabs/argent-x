import type { Atom } from "jotai"

import type { IRepository } from "../../../shared/storage/__new/interface"
import { atomWithSubscription } from "./atomWithSubscription"

export const atomFromRepo = <T>(
  repo: IRepository<T>,
): Atom<T[] | Promise<T[]>> => {
  return atomWithSubscription(
    () => repo.get(),
    (next) =>
      repo.subscribe(async (change) =>
        // newValue and get return the same reference when changing. While this usually is nice for performance, it breaks react rerenders, so we need to clone the array.
        next([...(change.newValue ?? (await repo.get()))]),
      ),
  )
}
