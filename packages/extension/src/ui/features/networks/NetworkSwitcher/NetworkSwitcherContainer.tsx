import {
  ButtonProps,
  Menu,
  Portal,
  usePrefersReducedMotion,
} from "@chakra-ui/react"
import { FC, Fragment, useCallback, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { NetworkStatus } from "../../../../shared/network"
import { routes } from "../../../routes"
import { autoSelectAccountOnNetwork } from "../../accounts/switchAccount"
import { useCurrentNetworkWithStatus } from "../hooks/useCurrentNetwork"
import { useNeedsToShowNetworkStatusWarning } from "../hooks/useNeedsToShowNetworkStatusWarning"
import { useNetworksWithStatuses } from "../hooks/useNetworks"
import { NetworkSwitcherButton } from "./NetworkSwitcherButton"
import {
  NetworkSwitcherList,
  NetworkSwitcherListProps,
} from "./NetworkSwitcherList"

const valuesToShowNetwortWarning: Array<NetworkStatus> = ["red", "amber"]

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
  const currentNetworkStatus = currentNetwork?.status ?? "unknown"

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

  /** In testing or if user has reduced motion, explicity disable menu animation */
  const prefersReducedMotion = usePrefersReducedMotion()
  const networkSwitcherListProps: Partial<NetworkSwitcherListProps> =
    prefersReducedMotion
      ? {
          motionProps: {
            variants: {},
          },
        }
      : {}
  /** Portal is flaky in e2e tests but required when animating in production. Only wrap in Portal if motion is enabled */
  const Container = prefersReducedMotion ? Fragment : Portal

  return (
    <Menu>
      {currentNetworkStatus !== null && (
        <NetworkSwitcherButton
          disabled={disabled}
          currentNetwork={currentNetwork}
          currentNetworkStatus={currentNetworkStatus}
          {...rest}
        />
      )}
      <Container>
        <NetworkSwitcherList
          currentNetwork={currentNetwork}
          allNetworks={allNetworksWithStatuses}
          onChangeNetwork={onChangeNetwork}
          {...networkSwitcherListProps}
        />
      </Container>
    </Menu>
  )
}
