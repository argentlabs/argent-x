import create from "zustand"
import { persist } from "zustand/middleware"

interface State {
  /** temporarily persist unverified email submitted for OTP verification, allows UI to restore on OTP screen */
  unverifiedEmail?: string
}

export const useShieldState = create<State>(
  persist((_set, _get) => ({}), { name: "shield" }),
)
