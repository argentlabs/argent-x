import { useView } from "../views/implementation/react"
import { isOnboardingCompleteView } from "../views/appState"

export function useIsOnboardingComplete() {
  return useView(isOnboardingCompleteView)
}
