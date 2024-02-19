import { atom } from "jotai"

import { discoverStore } from "../../shared/discover/storage"
import { atomFromStore } from "./implementation/atomFromStore"

export const discoverStoreView = atomFromStore(discoverStore)

export const discoverDataView = atom(async (get) => {
  const { data } = await get(discoverStoreView)
  return data
})

export const discoverViewedAtView = atom(async (get) => {
  const { viewedAt } = await get(discoverStoreView)
  return viewedAt
})
