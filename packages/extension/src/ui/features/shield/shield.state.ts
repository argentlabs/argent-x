import { atomWithStorage } from "jotai/utils"

interface State {
  /** temporarily persist unverified email submitted for OTP verification, allows UI to restore on OTP screen */
  unverifiedEmail?: string
}

export const shieldStateAtom = atomWithStorage<State>("shield", {})
