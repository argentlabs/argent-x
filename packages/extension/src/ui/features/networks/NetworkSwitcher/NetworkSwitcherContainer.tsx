import { ButtonProps, Menu, Portal } from "@chakra-ui/react"
import { FC, useCallback, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { NetworkStatus } from "../../../../shared/network"
import { routes } from "../../../routes"
import { autoSelectAccountOnNetwork } from "../../accounts/switchAccount"
import {
  useCurrentNetwork,
  useCurrentNetworkWithStatus,
} from "../hooks/useCurrentNetwork"
import { useNeedsToShowNetworkStatusWarning } from "../hooks/useNeedsToShowNetworkStatusWarning"
import { useNetworksWithStatuses } from "../hooks/useNetworks"
import { NetworkSwitcherButton } from "./NetworkSwitcherButton"
import { NetworkSwitcherList } from "./NetworkSwitcherList"

const valuesToShowNetwortWarning: Array<NetworkStatus> = ["degraded", "error"]

interface NetworkSwitcherProps extends ButtonProps {
  disabled?: boolean
}

export const NetworkSwitcherContainer: FC<NetworkSwitcherProps> = ({
  disabled,
  ...rest
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const allNetworksWithStatuses = useNetworksWithStatuses()
  const currentNetwork = useCurrentNetworkWithStatus()
  const [needsToShowNetworkStatusWarning] = useNeedsToShowNetworkStatusWarning()
  const currentNetworkStatus = currentNetwork?.status

  useEffect(() => {
    if (
      currentNetworkStatus &&
      valuesToShowNetwortWarning.includes(currentNetworkStatus) &&
      needsToShowNetworkStatusWarning
    ) {
      navigate(routes.networkWarning(location.pathname))
    }
    // just trigger on network status change
  }, [currentNetworkStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  const onChangeNetwork = useCallback(async (networkId: string) => {
    await autoSelectAccountOnNetwork(networkId)
  }, [])

  return (
    <Menu>
      {currentNetworkStatus && (
        <NetworkSwitcherButton
          disabled={disabled}
          currentNetwork={currentNetwork}
          currentNetworkStatus={currentNetworkStatus}
          {...rest}
        />
      )}
      <Portal>
        <NetworkSwitcherList
          currentNetwork={currentNetwork}
          allNetworks={allNetworksWithStatuses}
          onChangeNetwork={onChangeNetwork}
        />
      </Portal>
    </Menu>
  )
}
