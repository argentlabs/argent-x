import { FC } from "react"

import { settingsStore } from "../../../../shared/settings"
import { useKeyValueStorage } from "../../../hooks/useStorage"
import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"
import { AutoLockTimerSettingsScreen } from "./AutoLockTimerSettingsScreen"

export const AutoLockTimerSettingsScreenContainer: FC = () => {
  const onBack = useNavigateReturnToOrBack()
  const autoLockTimeMinutes = useKeyValueStorage(
    settingsStore,
    "autoLockTimeMinutes",
  )
  const onChange = (autoLockTimeMinutes: number) => {
    void settingsStore.set("autoLockTimeMinutes", autoLockTimeMinutes)
  }
  return (
    <AutoLockTimerSettingsScreen
      onBack={onBack}
      autoLockTimeMinutes={autoLockTimeMinutes}
      onChange={onChange}
    />
  )
}
