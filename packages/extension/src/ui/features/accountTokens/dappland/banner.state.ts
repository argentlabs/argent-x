import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface DapplandBannerState {
  hasSeenBanner: boolean
}

export const useDapplandBanner = create<DapplandBannerState>()(
  persist(
    (_set, _get) => ({
      hasSeenBanner: false,
    }),
    { name: "hasSeenDapplandBanner" },
  ),
)
