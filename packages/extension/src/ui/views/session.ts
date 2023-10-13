import { atom } from "jotai"
import { atomFromStore } from "./implementation/atomFromStore"
import { walletStore } from "../../shared/wallet/walletStore"
import { sessionService } from "../services/session"

const walletStoreView = atomFromStore(walletStore)

export const isBackupStoredView = atom(async (get) => {
  const store = await get(walletStoreView)
  return Boolean(store.backup)
})
// A bit of an unusual view but basically we can't share sessionStore between background and UI for security reasons
export const isPasswordSetView = atom(async () => {
  try {
    const isPasswordSet = await sessionService.getIsPasswordSet()
    return isPasswordSet
  } catch (error) {
    return false
  }
})
