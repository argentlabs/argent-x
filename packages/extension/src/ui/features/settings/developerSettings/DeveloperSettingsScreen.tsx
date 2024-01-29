import { BarBackButton, CellStack, NavigationContainer } from "@argent/ui"
import { FC } from "react"

import { routes } from "../../../routes"
import { SettingsMenuItemLink } from "../ui/SettingsMenuItem"

interface DeveloperSettingsScreenProps {
  showBetaFeatures: boolean
  showExperimentalSettings: boolean
}

export const DeveloperSettingsScreen: FC<DeveloperSettingsScreenProps> = ({
  showBetaFeatures,
  showExperimentalSettings,
}) => {
  return (
    <NavigationContainer
      leftButton={<BarBackButton />}
      title={"Developer Settings"}
    >
      <CellStack>
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
          to={routes.settingsSmartContractDevelopment()}
          title="Smart contract development"
        />
        {showExperimentalSettings && (
          <SettingsMenuItemLink
            to={routes.settingsExperimental()}
            title="Experimental"
          />
        )}
      </CellStack>
    </NavigationContainer>
  )
}
