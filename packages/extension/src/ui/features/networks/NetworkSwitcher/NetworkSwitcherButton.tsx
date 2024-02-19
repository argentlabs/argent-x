import { Button, ButtonProps, MenuButton } from "@chakra-ui/react"
import { FC } from "react"

import { Network, NetworkStatus } from "../../../../shared/network"
import { StatusIndicator } from "../../../components/StatusIndicator"

interface NetworkSwitcherButtonProps extends ButtonProps {
  disabled?: boolean
  currentNetworkStatus: NetworkStatus
  currentNetwork: Network
}

export const NetworkSwitcherButton: FC<NetworkSwitcherButtonProps> = ({
  disabled,
  currentNetworkStatus,
  currentNetwork,
  ...rest
}) => {
  return (
    <MenuButton
      aria-label="Selected network"
      data-testid="network-switcher-button"
      isDisabled={disabled}
      colorScheme={"neutrals"}
      size={"2xs"}
      as={Button}
      rightIcon={<StatusIndicator status={currentNetworkStatus} />}
      {...rest}
    >
      {currentNetwork.name}
    </MenuButton>
  )
}
