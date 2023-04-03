import { useEffect } from "react"

import { settingsStore } from "../../../shared/settings"
import { ARGENT_SHIELD_ENABLED } from "../../../shared/shield/constants"
import { useKeyValueStorage } from "../../../shared/storage/hooks"
import { useAccountsWithGuardian } from "./useAccountGuardian"

export const useArgentShieldEnabled = () => {
  const privacyUseArgentServices = useKeyValueStorage(
    settingsStore,
    "experimentalEnableArgentShield",
  )
  return ARGENT_SHIELD_ENABLED && privacyUseArgentServices
}

/**
 * Auto-enable Shield if at least one account has Guardian
 * TODO: remove when Shield is permanently enabled
 */

export const useAutoEnableArgentShield = () => {
  const accountsWithGuardian = useAccountsWithGuardian()
  const experimentalEnableArgentShield = useKeyValueStorage(
    settingsStore,
    "experimentalEnableArgentShield",
  )
  useEffect(() => {
    if (!ARGENT_SHIELD_ENABLED) {
      /** do nothing */
      return
    }
    if (accountsWithGuardian.length > 0 && !experimentalEnableArgentShield) {
      settingsStore.set("experimentalEnableArgentShield", true)
    }
  }, [accountsWithGuardian.length, experimentalEnableArgentShield])
}
