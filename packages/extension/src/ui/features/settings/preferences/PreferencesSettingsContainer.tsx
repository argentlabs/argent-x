import { FC, useCallback } from "react"
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
  const nftMarketplace = defaultNftMarketplaces[nftMarketplaceKey]
  const disableAnimation = useKeyValueStorage(settingsStore, "disableAnimation")
  const onDisableAnimationClick = useCallback(() => {
    void settingsStore.set("disableAnimation", !disableAnimation)
  }, [disableAnimation])
  const hideSpamTokens = useKeyValueStorage(settingsStore, "hideSpamTokens")
  const onHideSpamTokensClick = useCallback(() => {
    void settingsStore.set("hideSpamTokens", !hideSpamTokens)
  }, [hideSpamTokens])
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
      hideSpamTokens={hideSpamTokens}
      onHideSpamTokensClick={onHideSpamTokensClick}
      airGapEnabled={airGapEnabled}
      onEnableAirGapClick={onEnableAirGapClick}
    />
  )
}
