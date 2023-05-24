import { create } from "zustand"
import { persist } from "zustand/middleware"

interface SeenNetworkStatusState {
  lastSeen: number
  updateLastSeen: () => void
}

const useSeenNetworkStatus = create<SeenNetworkStatusState>()(
  persist(
    (set, _get) => ({
      lastSeen: 0,
      updateLastSeen: () =>
        set({
          lastSeen: Date.now(),
        }),
    }),
    { name: "seenNetworkStatusState" },
  ),
)

export const useNeedsToShowNetworkStatusWarning = () => {
  const { lastSeen, updateLastSeen } = useSeenNetworkStatus()

  return [
    Date.now() - lastSeen > 1000 * 60 * 60 * 24, // 24 hours
    updateLastSeen,
  ] as const
}
