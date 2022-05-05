import { FC } from "react"
import { Navigate } from "react-router-dom"

import { routes } from "../../routes"
import { useSelectedNetwork } from "../../states/selectedNetwork"
import { NetworkSettingsFormScreen } from "./NetworkSettingsFormScreen"

export const NetworkSettingsEditScreen: FC = () => {
  const [selectedCustomNetwork] = useSelectedNetwork()

  return selectedCustomNetwork ? (
    <NetworkSettingsFormScreen mode="edit" network={selectedCustomNetwork} />
  ) : (
    <Navigate to={routes.settingsNetworks.path} />
  )
}
