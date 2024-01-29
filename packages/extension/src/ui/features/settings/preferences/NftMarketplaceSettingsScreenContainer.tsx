import { FC } from "react"

import { settingsStore } from "../../../../shared/settings"
import { useKeyValueStorage } from "../../../hooks/useStorage"
import { NftMarketplaceSettingsScreen } from "./NftMarketplaceSettingsScreen"
import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"
import { NftMarketplaceKey } from "../../../../shared/nft/marketplaces"

export const NftMarketplaceSettingsScreenContainer: FC = () => {
  const onBack = useNavigateReturnToOrBack()
  const nftMarketplaceKey = useKeyValueStorage(
    settingsStore,
    "nftMarketplaceKey",
  )
  const onChange = (key: NftMarketplaceKey) => {
    void settingsStore.set("nftMarketplaceKey", key)
  }
  return (
    <NftMarketplaceSettingsScreen
      onBack={onBack}
      nftMarketplaceKey={nftMarketplaceKey}
      onChange={onChange}
    />
  )
}
