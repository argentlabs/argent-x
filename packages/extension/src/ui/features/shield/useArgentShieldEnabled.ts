import { settingsStore } from "../../../shared/settings"
import { ARGENT_SHIELD_ENABLED } from "../../../shared/shield/constants"
import { useKeyValueStorage } from "../../../shared/storage/hooks"

export const useArgentShieldEnabled = () => {
  const privacyUseArgentServices = useKeyValueStorage(
    settingsStore,
    "experimentalEnableArgentShield",
  )
  return ARGENT_SHIELD_ENABLED && privacyUseArgentServices
}
