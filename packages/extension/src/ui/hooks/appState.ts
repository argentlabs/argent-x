import { useView } from "../views/implementation/react"
import { isLockedView, isOnboardingCompleteView } from "../views/appState"

export function useIsOnboardingComplete() {
  return useView(isOnboardingCompleteView)
}

export function useIsLocked() {
  return useView(isLockedView)
}
