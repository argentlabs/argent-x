import { ExpandIcon } from "@argent/x-ui/icons"
import { BarBackButton, CellStack, NavigationContainer } from "@argent/x-ui"
import type { FC, ReactEventHandler } from "react"

import { routes } from "../../../../shared/ui/routes"
import { SettingsMenuItem, SettingsMenuItemLink } from "../ui/SettingsMenuItem"

interface AdvancedSettingsScreenProps {
  showBetaFeatures: boolean
  showExperimentalSettings: boolean
  extensionIsInTab: boolean
  extensionIsInSidePanel: boolean
  openExtensionInTab: ReactEventHandler
}

export const AdvancedSettingsScreen: FC<AdvancedSettingsScreenProps> = ({
  showBetaFeatures,
  showExperimentalSettings,
  extensionIsInTab,
  extensionIsInSidePanel,
  openExtensionInTab,
}) => {
  return (
    <NavigationContainer
      leftButton={<BarBackButton />}
      title={"Advanced settings"}
    >
      <CellStack>
        {!extensionIsInTab && !extensionIsInSidePanel && (
          <SettingsMenuItem
            rightIcon={<ExpandIcon />}
            onClick={openExtensionInTab}
            title="Extended view"
          />
        )}
        <SettingsMenuItemLink
          to={routes.settingsNetworks()}
          title="Manage networks"
        />
        {showBetaFeatures && (
          <SettingsMenuItemLink
            to={routes.settingsBetaFeatures()}
            title="Beta features"
          />
        )}
        <SettingsMenuItemLink
          to={routes.settingsClearLocalStorage()}
          title="Clear local storage"
        />
        <SettingsMenuItemLink
          to={routes.deploymentData()}
          title="Deployment data"
        />
        {showExperimentalSettings && (
          <SettingsMenuItemLink
            to={routes.settingsExperimental()}
            title="Experimental"
          />
        )}
        <SettingsMenuItemLink
          to={routes.settingsDownloadLogs()}
          title="Download application logs"
        />
        <SettingsMenuItemLink
          rightIcon={<ExpandIcon />}
          to={"https://demo-dapp-starknet.vercel.app/?section=declare"}
          title="Declare & deploy"
          target="_blank"
        />
      </CellStack>
    </NavigationContainer>
  )
}
