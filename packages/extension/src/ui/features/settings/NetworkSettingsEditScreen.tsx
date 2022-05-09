import { FC } from "react"
import { Navigate } from "react-router-dom"

import { routes } from "../../routes"
import { NetworkSettingsFormScreen } from "./NetworkSettingsFormScreen"
import { useSelectedNetwork } from "./selectedNetwork.state"

export const NetworkSettingsEditScreen: FC = () => {
  const [selectedCustomNetwork] = useSelectedNetwork()

  return selectedCustomNetwork ? (
    <NetworkSettingsFormScreen mode="edit" network={selectedCustomNetwork} />
  ) : (
    <Navigate to={routes.settingsNetworks.path} />
  )
}
