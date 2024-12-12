import type { ButtonProps } from "@chakra-ui/react"
import { Button, MenuButton } from "@chakra-ui/react"
import type { FC } from "react"

import type { ColorStatus } from "../../../shared/network"
import { StatusIndicator } from "../../components/StatusIndicator"

interface NetworkSwitcherButtonProps extends ButtonProps {
  currentNetworkStatus: ColorStatus
  currentNetworkName: string
}

export const NetworkSwitcherButton: FC<NetworkSwitcherButtonProps> = ({
  currentNetworkStatus,
  currentNetworkName,
  ...rest
}) => {
  return (
    <MenuButton
      aria-label="Selected network"
      data-testid="network-switcher-button"
      size={"2xs"}
      as={Button}
      rightIcon={<StatusIndicator status={currentNetworkStatus} />}
      {...rest}
    >
      {currentNetworkName}
    </MenuButton>
  )
}
