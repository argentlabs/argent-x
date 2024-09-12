import { FC } from "react"
import { settingsStore } from "../../../../shared/settings"
import { useKeyValueStorage } from "../../../hooks/useStorage"
import { SecurityAndPrivacySettingsScreen } from "./SecurityAndPrivacySettingsScreen"
import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"
import { useCurrentPathnameWithQuery } from "../../../hooks/useRoute"

export const SecurityAndPrivacySettingsScreenContainer: FC = () => {
  const onBack = useNavigateReturnToOrBack()
  const returnTo = useCurrentPathnameWithQuery()

  const privacyAutomaticErrorReporting = useKeyValueStorage(
    settingsStore,
    "privacyAutomaticErrorReporting",
  )

  const privacyShareAnalyticsData = useKeyValueStorage(
    settingsStore,
    "privacyShareAnalyticsData",
  )

  const autoLockTimeMinutes = useKeyValueStorage(
    settingsStore,
    "autoLockTimeMinutes",
  )

  const settings = {
    privacyAutomaticErrorReporting,
    privacyShareAnalyticsData,
    autoLockTimeMinutes,
  }

  const onChangeSetting = settingsStore.set.bind(settingsStore)

  return (
    <SecurityAndPrivacySettingsScreen
      onBack={onBack}
      returnTo={returnTo}
      settings={settings}
      onChangeSetting={onChangeSetting}
    />
  )
}
