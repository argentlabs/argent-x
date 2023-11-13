import { atom } from "jotai"

import { recoveryStore } from "../../shared/recovery/storage"
import { atomFromStore } from "./implementation/atomFromStore"

export const recoveryStoreView = atomFromStore(recoveryStore)

export const isRecoveringView = atom(async (get) => {
  const { isRecovering } = await get(recoveryStoreView)
  return isRecovering
})
