import { FC } from "react"
import { Navigate, useParams } from "react-router-dom"

import { routes } from "../../../../../shared/ui/routes"
import { NetworkSettingsFormScreenContainer } from "./NetworkSettingsFormScreenContainer"
import { useNetworkOrUndefined } from "../../../networks/hooks/useNetwork"

export const NetworkSettingsEditScreen: FC = () => {
  const { networkId } = useParams<"networkId">()

  const network = useNetworkOrUndefined(networkId)

  return network ? (
    <NetworkSettingsFormScreenContainer mode="edit" network={network} />
  ) : (
    <Navigate to={routes.settingsNetworks.path} />
  )
}
