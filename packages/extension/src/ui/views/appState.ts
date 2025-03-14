import { atom } from "jotai"

import { walletStore } from "../../shared/wallet/walletStore"
import { atomFromStore } from "./implementation/atomFromStore"

/**
 * @internal use `isOnboardingCompleteView` instead
 */
const unsafe_allWalletView = atomFromStore(walletStore)

export const isOnboardingCompleteView = atom(async (get) => {
  const wallet = await get(unsafe_allWalletView)
  const isOnboardingComplete = Boolean(wallet.backup)
  return isOnboardingComplete
})
