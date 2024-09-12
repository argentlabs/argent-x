import { FC } from "react"

import { settingsStore } from "../../../../shared/settings"
import { useKeyValueStorage } from "../../../hooks/useStorage"
import { NftMarketplaceSettingsScreen } from "./NftMarketplaceSettingsScreen"
import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"
import { NftMarketplaceKey } from "../../../../shared/nft/marketplaces"
import { ampli } from "../../../../shared/analytics"

export const NftMarketplaceSettingsScreenContainer: FC = () => {
  const onBack = useNavigateReturnToOrBack()
  const nftMarketplaceKey = useKeyValueStorage(
    settingsStore,
    "nftMarketplaceKey",
  )
  const onChange = (key: NftMarketplaceKey) => {
    void ampli.nftMarketplaceChanged({
      provider: key,
      "wallet platform": "browser extension",
    })
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
