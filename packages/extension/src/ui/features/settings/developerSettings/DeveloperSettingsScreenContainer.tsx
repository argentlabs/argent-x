import { FC } from "react"

import {
  isBetaFeaturesEnabled,
  isExperimentalSettingsEnabled,
} from "../../../../shared/settings"
import { useIsMainnet } from "../../networks/hooks/useIsMainnet"
import { DeveloperSettingsScreen } from "./DeveloperSettingsScreen"

export const DeveloperSettingsScreenContainer: FC = () => {
  const isMainnet = useIsMainnet()

  return (
    <DeveloperSettingsScreen
      showBetaFeatures={isBetaFeaturesEnabled && isMainnet}
      showExperimentalSettings={isExperimentalSettingsEnabled}
    />
  )
}
