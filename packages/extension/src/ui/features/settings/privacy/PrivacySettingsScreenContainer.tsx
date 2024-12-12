import type { FC } from "react"

import { settingsStore } from "../../../../shared/settings"
import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"
import { useKeyValueStorage } from "../../../hooks/useStorage"
import { PrivacySettingsScreen } from "./PrivacySettingsScreen"

export const PrivacySettingsScreenContainer: FC = () => {
  const onBack = useNavigateReturnToOrBack()

  const privacyAutomaticErrorReporting = useKeyValueStorage(
    settingsStore,
    "privacyAutomaticErrorReporting",
  )

  const privacyShareAnalyticsData = useKeyValueStorage(
    settingsStore,
    "privacyShareAnalyticsData",
  )

  const settings = {
    privacyAutomaticErrorReporting,
    privacyShareAnalyticsData,
  }

  const onChangeSetting = settingsStore.set.bind(settingsStore)

  return (
    <PrivacySettingsScreen
      onBack={onBack}
      settings={settings}
      onChangeSetting={(key, value) => void onChangeSetting(key, value)}
    />
  )
}
