import { atom } from "jotai"

import { recoveryStore } from "../../shared/recovery/storage"
import { atomFromStore } from "./implementation/atomFromStore"

export const recoveryStoreView = atomFromStore(recoveryStore)

export const isRecoveringView = atom(async (get) => {
  const { isRecovering } = await get(recoveryStoreView)
  return isRecovering
})

export const errorRecoveringView = atom(async (get) => {
  const { errorRecovering } = await get(recoveryStoreView)
  return errorRecovering
})

export const isClearingStorageView = atom(async (get) => {
  const { isClearingStorage } = await get(recoveryStoreView)
  return isClearingStorage
})
