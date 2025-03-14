import type { FC } from "react"
import { useCallback } from "react"
import { defaultNftMarketplaces } from "../../../../shared/nft/marketplaces"
import { settingsStore } from "../../../../shared/settings"
import { defaultBlockExplorers } from "../../../../shared/settings/defaultBlockExplorers"
import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"
import {
  useGetSetKeyValueStorage,
  useKeyValueStorage,
} from "../../../hooks/useStorage"
import { useCurrentPathnameWithQuery } from "../../../hooks/useRoute"
import { PreferencesSettings } from "./PreferencesSettings"

export const PreferencesSettingsContainer: FC = () => {
  const returnTo = useCurrentPathnameWithQuery()
  const onBack = useNavigateReturnToOrBack()
  const [blockExplorerKey] = useGetSetKeyValueStorage(
    settingsStore,
    "blockExplorerKey",
  )
  const blockExplorer = defaultBlockExplorers[blockExplorerKey]
  const [nftMarketplaceKey] = useGetSetKeyValueStorage(
    settingsStore,
    "nftMarketplaceKey",
  )
  const selectedIdProvider = useKeyValueStorage(settingsStore, "idProvider")
  const nftMarketplace = defaultNftMarketplaces[nftMarketplaceKey]
  const [disableAnimation, setDisableAnimation] = useGetSetKeyValueStorage(
    settingsStore,
    "disableAnimation",
  )
  const onDisableAnimationClick = useCallback(() => {
    setDisableAnimation(!disableAnimation)
  }, [disableAnimation, setDisableAnimation])
  const [airGapEnabled, setAirGapEnabled] = useGetSetKeyValueStorage(
    settingsStore,
    "airGapEnabled",
  )
  const onEnableAirGapClick = useCallback(() => {
    setAirGapEnabled(!airGapEnabled)
  }, [airGapEnabled, setAirGapEnabled])

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
