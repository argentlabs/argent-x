import { create } from "zustand"
import { persist } from "zustand/middleware"

import { INITIAL_ALLOWED_SLIPPAGE } from "../utils/constants"

export interface UserState {
  // user defined slippage tolerance in bips, used in all txns
  userSlippageTolerance: number
  updateUserSlippageTolerance: (userSlippageTolerance: number) => void
}

export const useUserState = create<UserState>()(
  persist(
    (set) => ({
      userSlippageTolerance: INITIAL_ALLOWED_SLIPPAGE,
      updateUserSlippageTolerance: (userSlippageTolerance: number) =>
        set((state) => {
          return {
            ...state,
            userSlippageTolerance,
          }
        }),
    }),
    { name: "avnu:user" },
  ),
)
