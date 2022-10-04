import create from "zustand"
import { persist } from "zustand/middleware"

import { useCheckV4UpgradeAvailable } from "../accounts/upgrade.service"

interface ShowNetworkUpgradeMessage {
  lastShown: number
  updateLastShown: () => void
}

const useShowNetworkUpgradeMessage = create<ShowNetworkUpgradeMessage>(
  // TODO: Add persist before merge
  //   persist(
  (set, _get) => ({
    lastShown: 0,
    updateLastShown: () => set({ lastShown: Date.now() }),
  }),
  //   { name: "networkUpgradeMessageState" },
  //   ),
)

export const useShouldShowNetworkUpgradeMessage = () => {
  const { lastShown, updateLastShown } = useShowNetworkUpgradeMessage()

  const shouldShow = Date.now() - lastShown > 1000 * 60 * 60 * 24 * 2 // Should show if not shown within last two days

  const v4UpgradeAvailableOnTestnet = useCheckV4UpgradeAvailable("goerli-alpha")

  const v4UpgradeAvailableOnMainnet =
    useCheckV4UpgradeAvailable("mainnet-alpha")

  return {
    shouldShow:
      shouldShow &&
      (v4UpgradeAvailableOnTestnet || v4UpgradeAvailableOnMainnet),
    updateLastShown,
    v4UpgradeAvailableOnTestnet,
    v4UpgradeAvailableOnMainnet,
  } as const
}
