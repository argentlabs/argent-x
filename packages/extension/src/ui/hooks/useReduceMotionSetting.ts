import { settingsStore } from "../../shared/settings"
import { useKeyValueStorage } from "./useStorage"

export function useReduceMotionSetting() {
  const disableAnimation = useKeyValueStorage(settingsStore, "disableAnimation")
  const reducedMotion = disableAnimation ? "always" : "user"
  return reducedMotion
}
