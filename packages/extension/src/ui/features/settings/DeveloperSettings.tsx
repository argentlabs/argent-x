import { BarBackButton, CellStack, NavigationBar } from "@argent/ui"
import { FC } from "react"
import { useNavigate } from "react-router-dom"

import {
  isExperimentalSettingsEnabled,
  isBetaFeaturesEnabled,
} from "../../../shared/settings"
import { routes } from "../../routes"
import { SettingsMenuItem } from "./SettingsMenuItem"
import { useIsMainnet } from "../networks/hooks/useIsMainnet"

const DeveloperSettings: FC = () => {
  const navigate = useNavigate()
  const isMainnet = useIsMainnet()

  return (
    <>
      <NavigationBar
        leftButton={<BarBackButton onClick={() => navigate(-1)} />}
        title={"Developer Settings"}
      />

      <CellStack>
        <SettingsMenuItem
          to={routes.settingsNetworks()}
          title="Manage networks"
        />

        <SettingsMenuItem
          to={routes.settingsBlockExplorer()}
          title="Block explorer"
        />

        {isBetaFeaturesEnabled && isMainnet && (
          <SettingsMenuItem
            to={routes.settingsBetaFeatures()}
            title="Beta features"
          />
        )}

        <SettingsMenuItem
          to={routes.settingsSmartContractDevelopment()}
          title="Smart contract development"
        />
        {isExperimentalSettingsEnabled && (
          <SettingsMenuItem
            to={routes.settingsExperimental()}
            title="Experimental"
          />
        )}
      </CellStack>
    </>
  )
}
export { DeveloperSettings }
