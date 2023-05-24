import { Button, MenuButton } from "@chakra-ui/react"
import { FC } from "react"

import { Network, NetworkStatus } from "../../../../shared/network"
import {
  StatusIndicator,
  mapNetworkStatusToColor,
} from "../../../components/StatusIndicator"

interface NetworkSwitcherButtonProps {
  disabled?: boolean
  currentNetworkStatus: NetworkStatus
  currentNetwork: Network
}

export const NetworkSwitcherButton: FC<NetworkSwitcherButtonProps> = ({
  disabled,
  currentNetworkStatus,
  currentNetwork,
}) => {
  return (
    <MenuButton
      aria-label="Selected network"
      data-testid="network-switcher-button"
      isDisabled={disabled}
      colorScheme={"neutrals"}
      size={"2xs"}
      as={Button}
      rightIcon={
        <StatusIndicator
          color={mapNetworkStatusToColor(currentNetworkStatus)}
        />
      }
    >
      {currentNetwork.name}
    </MenuButton>
  )
}
