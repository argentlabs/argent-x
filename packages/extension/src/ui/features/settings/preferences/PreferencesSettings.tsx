import {
  BarBackButton,
  CellStack,
  NavigationContainer,
  Switch,
} from "@argent/x-ui"
import type { FC, ReactEventHandler } from "react"

import type { NftMarketplace } from "../../../../shared/nft/marketplaces"
import type { BlockExplorer } from "../../../../shared/settings/defaultBlockExplorers"
import { routes } from "../../../../shared/ui/routes"
import { SettingsMenuItem, SettingsMenuItemLink } from "../ui/SettingsMenuItem"
import { selectedNetworkIdView } from "../../../views/network"
import { useView } from "../../../views/implementation/react"

interface PreferencesSettingsProps {
  onBack: ReactEventHandler
  returnTo: string
  blockExplorer: BlockExplorer
  nftMarketplace: NftMarketplace
  disableAnimation: boolean
  onDisableAnimationClick: ReactEventHandler
  airGapEnabled: boolean
  onEnableAirGapClick: ReactEventHandler
  selectedIdProvider: "starknetid" | "brotherid"
}

export const PreferencesSettings: FC<PreferencesSettingsProps> = ({
  onBack,
  returnTo,
  blockExplorer,
  nftMarketplace,
  disableAnimation,
  onDisableAnimationClick,
  airGapEnabled,
  onEnableAirGapClick,
  selectedIdProvider,
}) => {
  const selectedNetworkId = useView(selectedNetworkIdView)

  return (
    <NavigationContainer
      leftButton={<BarBackButton onClick={onBack} />}
      title={"Preferences"}
    >
      <CellStack>
        <SettingsMenuItemLink
          to={routes.settingsHiddenAndSpamTokens(returnTo)}
          title="Hidden and spam tokens"
        />
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
          to={routes.settingsIdProvider(returnTo)}
          title="Default Identity provider"
          subtitle={
            selectedIdProvider === "brotherid" ? "BrotherID" : "StarknetID"
          }
        />
        <SettingsMenuItemLink
          to={routes.accountsHidden(selectedNetworkId, returnTo)}
          title="Hidden accounts"
        />
        <SettingsMenuItem
          rightIcon={<Switch isChecked={airGapEnabled} pointerEvents="none" />}
          title="Air gap transaction with Ledger"
          subtitle="Enable to show transaction details in QR"
          onClick={onEnableAirGapClick}
        />
        <SettingsMenuItem
          rightIcon={
            <Switch isChecked={disableAnimation} pointerEvents="none" />
          }
          title="Disable animations"
          subtitle="Disable to optimise for performance"
          onClick={onDisableAnimationClick}
        />
      </CellStack>
    </NavigationContainer>
  )
}
