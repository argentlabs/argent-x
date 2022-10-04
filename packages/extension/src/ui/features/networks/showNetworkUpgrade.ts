import create from "zustand"
import { persist } from "zustand/middleware"

import { useCheckV4UpgradeAvailable } from "../accounts/upgrade.service"

interface ShowNetworkUpgradeMessage {
  lastShown: number
  updateLastShown: () => void
}

const useShowNetworkUpgradeMessage = create<ShowNetworkUpgradeMessage>(
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
  //   const network = useCurrentNetwork()

  const shouldShow = Date.now() - lastShown > 1000 * 60 * 60 * 24 * 2 // Should show if not shown within last two days

  const { data: v4UpgradeAvailableOnTestnet } =
    useCheckV4UpgradeAvailable("goerli-alpha")

  const { data: v4UpgradeAvailableOnMainnet } =
    useCheckV4UpgradeAvailable("mainnet-alpha")

  return [
    shouldShow && (v4UpgradeAvailableOnTestnet || v4UpgradeAvailableOnMainnet),
    updateLastShown,
  ] as const
}
