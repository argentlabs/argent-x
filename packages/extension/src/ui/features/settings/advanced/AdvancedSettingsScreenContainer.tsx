import { type FC } from "react"
import { voidify } from "@argent/x-shared"

import {
  isBetaFeaturesEnabled,
  isExperimentalSettingsEnabled,
} from "../../../../shared/settings"
import { useIsMainnet } from "../../networks/hooks/useIsMainnet"
import { AdvancedSettingsScreen } from "./AdvancedSettingsScreen"
import {
  useExtensionIsInSidePanel,
  useOpenExtensionInTab,
} from "../../browser/tabs"
import { useExtensionIsInTab } from "../../browser/tabs"

export const AdvancedSettingsScreenContainer: FC = () => {
  const isMainnet = useIsMainnet()
  const openExtensionInTab = useOpenExtensionInTab()
  const extensionIsInTab = useExtensionIsInTab()
  const extensionIsInSidePanel = useExtensionIsInSidePanel()
  return (
    <AdvancedSettingsScreen
      showBetaFeatures={isBetaFeaturesEnabled && isMainnet}
      showExperimentalSettings={isExperimentalSettingsEnabled}
      extensionIsInTab={extensionIsInTab}
      extensionIsInSidePanel={extensionIsInSidePanel}
      openExtensionInTab={voidify(openExtensionInTab)}
    />
  )
}
