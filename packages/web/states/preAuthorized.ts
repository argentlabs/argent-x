import create from "zustand"
import { persist } from "zustand/middleware"

interface PreAuthorizedState {
  preAuthorizedOrigins: string[]
  isPreAuthorized: (origin: string) => boolean
  addPreAuthorizedOrigin: (origin: string) => void
  removePreAuthorizedOrigin: (origin: string) => void
}

export const usePreAuthorized = create(
  persist<PreAuthorizedState>(
    (set, get) => ({
      preAuthorizedOrigins: [],

      isPreAuthorized: (origin: string) =>
        get().preAuthorizedOrigins.includes(origin),

      addPreAuthorizedOrigin: (origin: string) =>
        set((state) => {
          if (!state.preAuthorizedOrigins.includes(origin)) {
            return {
              preAuthorizedOrigins: [...state.preAuthorizedOrigins, origin],
            }
          }
          return {}
        }),
      removePreAuthorizedOrigin: (origin: string) =>
        set((state) => ({
          preAuthorizedOrigins: state.preAuthorizedOrigins.filter(
            (o) => o !== origin,
          ),
        })),
    }),
    {
      name: "preAuthorized",
    },
  ),
)
