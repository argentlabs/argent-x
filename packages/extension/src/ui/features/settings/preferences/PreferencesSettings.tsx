import {
  BarBackButton,
  CellStack,
  NavigationContainer,
  Switch,
} from "@argent/ui"
import { FC, ReactEventHandler } from "react"

import { NftMarketplace } from "../../../../shared/nft/marketplaces"
import { BlockExplorer } from "../../../../shared/settings/defaultBlockExplorers"
import { BaseWalletAccount } from "../../../../shared/wallet.model"
import { routes } from "../../../routes"
import { SettingsMenuItem, SettingsMenuItemLink } from "../ui/SettingsMenuItem"

interface PreferencesSettingsProps {
  onBack: ReactEventHandler
  hideTokensWithNoBalance: boolean
  toggleHideTokensWithNoBalance: ReactEventHandler
  isSignedIn: boolean
  returnTo: string
  blockExplorer: BlockExplorer
  nftMarketplace: NftMarketplace
  selectedAccount?: BaseWalletAccount
}

export const PreferencesSettings: FC<PreferencesSettingsProps> = ({
  onBack,
  toggleHideTokensWithNoBalance,
  hideTokensWithNoBalance,
  isSignedIn,
  returnTo,
  blockExplorer,
  nftMarketplace,
  selectedAccount,
}) => {
  return (
    <NavigationContainer
      leftButton={<BarBackButton onClick={onBack} />}
      title={"Preferences"}
    >
      <CellStack>
        <SettingsMenuItem
          onClick={toggleHideTokensWithNoBalance}
          title={"Hide tokens with no balance"}
          subtitle={"ETH will always be shown"}
          rightIcon={<Switch isChecked={hideTokensWithNoBalance} />}
        >
          Change account implementation
        </SettingsMenuItem>
        <SettingsMenuItemLink
          to={routes.settingsBlockExplorer(returnTo)}
          title="Default block explorer"
          subtitle={blockExplorer.title}
        />
        <SettingsMenuItemLink
          to={routes.settingsNftMarketplace(returnTo)}
          title="Default NFT marketplace"
          subtitle={nftMarketplace.title}
        />
        <SettingsMenuItemLink
          to={
            isSignedIn
              ? routes.settingsEmailNotifications(returnTo)
              : routes.argentAccountEmail(
                  selectedAccount?.address,
                  "emailPreferences",
                  returnTo,
                )
          }
          title="Email notifications"
        />
      </CellStack>
    </NavigationContainer>
  )
}
