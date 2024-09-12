import { liveQuery } from "dexie"
import { atomWithObservable } from "jotai/utils"

export const atomFromQuery = <T>(querier: () => T | Promise<T>) =>
  atomWithObservable(() => liveQuery(querier))
