import { BarBackButton, NavigationBar } from "@argent/ui"
import { Stack } from "@chakra-ui/react"
import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { isExperimentalSettingsEnabled } from "../../../shared/settings"
import { routes } from "../../routes"
import { SettingsMenuItem } from "./SettingsMenuItem"

const DeveloperSettings: FC = () => {
  const navigate = useNavigate()
  return (
    <>
      <NavigationBar
        leftButton={<BarBackButton onClick={() => navigate(-1)} />}
        title={"Developer Settings"}
      />

      <Stack direction="column" mx="4">
        <SettingsMenuItem
          to={routes.settingsNetworks()}
          title="Manage networks"
        />

        <SettingsMenuItem
          to={routes.settingsBlockExplorer()}
          title="Block explorer"
        />

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
      </Stack>
    </>
  )
}
export { DeveloperSettings }
