import { atom } from "jotai"

import { walletStore } from "../../shared/wallet/walletStore"
import { atomFromStore } from "./implementation/atomFromStore"
import { sessionRepo } from "../../shared/account/store/session"

/**
 * @internal use `isOnboardingCompleteView` instead
 */
const unsafe_allWalletView = atomFromStore(walletStore)

export const isOnboardingCompleteView = atom(async (get) => {
  const wallet = await get(unsafe_allWalletView)
  const isOnboardingComplete = Boolean(wallet.backup)
  return isOnboardingComplete
})

/**
 * @internal use `isLockedView` instead
 */
const unsafe_allSessionView = atomFromStore(sessionRepo)

export const isLockedView = atom(async (get) => {
  const session = await get(unsafe_allSessionView)
  const isUnlocked = Boolean(session)
  return !isUnlocked
})
