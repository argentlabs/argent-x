import type { FC } from "react"

import { settingsStore } from "../../../../shared/settings"
import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"
import { useCurrentPathnameWithQuery } from "../../../hooks/useRoute"
import { useKeyValueStorage } from "../../../hooks/useStorage"
import { SecurityAndRecoverySettingsScreen } from "./SecurityAndRecoverySettingsScreen"

export const SecurityAndRecoverySettingsScreenContainer: FC = () => {
  const onBack = useNavigateReturnToOrBack()
  const returnTo = useCurrentPathnameWithQuery()

  const autoLockTimeMinutes = useKeyValueStorage(
    settingsStore,
    "autoLockTimeMinutes",
  )

  const settings = {
    autoLockTimeMinutes,
  }

  const onChangeSetting = settingsStore.set.bind(settingsStore)

  return (
    <SecurityAndRecoverySettingsScreen
      onBack={onBack}
      returnTo={returnTo}
      settings={settings}
      onChangeSetting={(key, value) => void onChangeSetting(key, value)}
    />
  )
}
