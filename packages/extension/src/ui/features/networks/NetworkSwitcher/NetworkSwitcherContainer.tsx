import {
  ButtonProps,
  Menu,
  Portal,
  usePrefersReducedMotion,
} from "@chakra-ui/react"
import { FC, Fragment, useCallback } from "react"

import { autoSelectAccountOnNetwork } from "../../accounts/switchAccount"
import { useCurrentNetworkWithStatus } from "../hooks/useCurrentNetwork"
import { useNetworksWithStatuses } from "../hooks/useNetworks"
import { NetworkSwitcherButton } from "./NetworkSwitcherButton"
import {
  NetworkSwitcherList,
  NetworkSwitcherListProps,
} from "./NetworkSwitcherList"

interface NetworkSwitcherProps extends ButtonProps {
  disabled?: boolean
}

export const NetworkSwitcherContainer: FC<NetworkSwitcherProps> = ({
  disabled,
  ...rest
}) => {
  const allNetworksWithStatuses = useNetworksWithStatuses()
  const currentNetwork = useCurrentNetworkWithStatus()
  const currentNetworkStatus = currentNetwork?.status ?? "unknown"

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
