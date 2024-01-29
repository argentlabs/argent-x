import { FC, MouseEvent } from "react"
import { defaultNftMarketplaces } from "../../../../shared/nft/marketplaces"
import { settingsStore } from "../../../../shared/settings"
import { defaultBlockExplorers } from "../../../../shared/settings/defaultBlockExplorers"
import { useKeyValueStorage } from "../../../hooks/useStorage"
import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"
import { useCurrentPathnameWithQuery } from "../../../routes"
import { selectedAccountView } from "../../../views/account"
import { useView } from "../../../views/implementation/react"
import { useIsSignedIn } from "../../argentAccount/hooks/useIsSignedIn"
import { PreferencesSettings } from "./PreferencesSettings"

export const PreferencesSettingsContainer: FC = () => {
  const isSignedIn = useIsSignedIn()
  const selectedAccount = useView(selectedAccountView)
  const returnTo = useCurrentPathnameWithQuery()
  const onBack = useNavigateReturnToOrBack()
  const blockExplorerKey = useKeyValueStorage(settingsStore, "blockExplorerKey")
  const blockExplorer = defaultBlockExplorers[blockExplorerKey]
  const nftMarketplaceKey = useKeyValueStorage(
    settingsStore,
    "nftMarketplaceKey",
  )
  const nftMarketplace = defaultNftMarketplaces[nftMarketplaceKey]
  const hideTokensWithNoBalance = useKeyValueStorage(
    settingsStore,
    "hideTokensWithNoBalance",
  )
  const toggleHideTokensWithNoBalance = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault()
    void settingsStore.set("hideTokensWithNoBalance", !hideTokensWithNoBalance)
  }
  return (
    <PreferencesSettings
      onBack={onBack}
      toggleHideTokensWithNoBalance={toggleHideTokensWithNoBalance}
      hideTokensWithNoBalance={hideTokensWithNoBalance}
      isSignedIn={isSignedIn}
      returnTo={returnTo}
      blockExplorer={blockExplorer}
      nftMarketplace={nftMarketplace}
      selectedAccount={selectedAccount}
    />
  )
}
