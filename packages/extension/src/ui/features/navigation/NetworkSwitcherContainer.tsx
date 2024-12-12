import type { ButtonProps } from "@chakra-ui/react"
import { Menu, Portal, usePrefersReducedMotion } from "@chakra-ui/react"
import type { FC } from "react"
import { Fragment, useMemo } from "react"

import { useNetworksWithStatuses } from "../../features/networks/hooks/useNetworks"
import { NetworkSwitcherButton } from "./NetworkSwitcherButton"
import type { NetworkSwitcherListProps } from "./NetworkSwitcherList"
import { NetworkSwitcherList } from "./NetworkSwitcherList"

interface NetworkSwitcherProps extends ButtonProps {
  networkId: string
  onChangeNetworkId: (networkId: string) => void
}

export const NetworkSwitcherContainer: FC<NetworkSwitcherProps> = ({
  networkId,
  onChangeNetworkId,
  ...rest
}) => {
  const allNetworksWithStatuses = useNetworksWithStatuses()
  const networkWithStatus = useMemo(
    () => allNetworksWithStatuses.find((n) => n.id === networkId),
    [allNetworksWithStatuses, networkId],
  )

  /** In testing or if user has reduced motion, explicity disable menu animation */
  const prefersReducedMotion = usePrefersReducedMotion()
  const networkSwitcherListProps: Partial<NetworkSwitcherListProps> =
    useMemo(() => {
      return prefersReducedMotion
        ? {
            motionProps: {
              variants: {},
            },
          }
        : {}
    }, [prefersReducedMotion])

  /** Portal is flaky in e2e tests but required when animating in production. Only wrap in Portal if motion is enabled */
  const Container = prefersReducedMotion ? Fragment : Portal

  return (
    <Menu placement="bottom">
      <NetworkSwitcherButton
        currentNetworkName={networkWithStatus?.name ?? "Unknown network"}
        currentNetworkStatus={networkWithStatus?.status ?? "unknown"}
        {...rest}
      />
      <Container>
        <NetworkSwitcherList
          networkId={networkId}
          allNetworks={allNetworksWithStatuses}
          onChangeNetworkId={onChangeNetworkId}
          {...networkSwitcherListProps}
        />
      </Container>
    </Menu>
  )
}
