import type { FC } from "react"
import { useCallback } from "react"
import { defaultNftMarketplaces } from "../../../../shared/nft/marketplaces"
import { settingsStore } from "../../../../shared/settings"
import { defaultBlockExplorers } from "../../../../shared/settings/defaultBlockExplorers"
import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"
import { useKeyValueStorage } from "../../../hooks/useStorage"
import { useCurrentPathnameWithQuery } from "../../../hooks/useRoute"
import { PreferencesSettings } from "./PreferencesSettings"

export const PreferencesSettingsContainer: FC = () => {
  const returnTo = useCurrentPathnameWithQuery()
  const onBack = useNavigateReturnToOrBack()
  const blockExplorerKey = useKeyValueStorage(settingsStore, "blockExplorerKey")
  const blockExplorer = defaultBlockExplorers[blockExplorerKey]
  const nftMarketplaceKey = useKeyValueStorage(
    settingsStore,
    "nftMarketplaceKey",
  )
  const selectedIdProvider = useKeyValueStorage(settingsStore, "idProvider")
  const nftMarketplace = defaultNftMarketplaces[nftMarketplaceKey]
  const disableAnimation = useKeyValueStorage(settingsStore, "disableAnimation")
  const onDisableAnimationClick = useCallback(() => {
    void settingsStore.set("disableAnimation", !disableAnimation)
  }, [disableAnimation])
  const airGapEnabled = useKeyValueStorage(settingsStore, "airGapEnabled")
  const onEnableAirGapClick = useCallback(() => {
    void settingsStore.set("airGapEnabled", !airGapEnabled)
  }, [airGapEnabled])

  return (
    <PreferencesSettings
      onBack={onBack}
      returnTo={returnTo}
      blockExplorer={blockExplorer}
      nftMarketplace={nftMarketplace}
      disableAnimation={disableAnimation}
      onDisableAnimationClick={onDisableAnimationClick}
      airGapEnabled={airGapEnabled}
      onEnableAirGapClick={onEnableAirGapClick}
      selectedIdProvider={selectedIdProvider}
    />
  )
}
