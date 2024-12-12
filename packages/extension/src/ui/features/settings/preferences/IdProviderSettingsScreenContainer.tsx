import type { FC } from "react"

import { settingsStore } from "../../../../shared/settings"
import { useKeyValueStorage } from "../../../hooks/useStorage"
import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"
import { IdProviderSettingsScreen } from "./IdProviderSettingsScreen"

export const IdProviderSettingsScreenContainer: FC = () => {
  const onBack = useNavigateReturnToOrBack()
  const selectedIdProvider = useKeyValueStorage(settingsStore, "idProvider")

  const onChange = (key: "starknetid" | "brotherid") => {
    void settingsStore.set("idProvider", key)
  }
  return (
    <IdProviderSettingsScreen
      onBack={onBack}
      selectedIdProvider={selectedIdProvider}
      onChange={onChange}
    />
  )
}
