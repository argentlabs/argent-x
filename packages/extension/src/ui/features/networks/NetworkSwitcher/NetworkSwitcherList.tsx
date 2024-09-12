import { B3, L2, buttonHoverStyle } from "@argent/x-ui"
import { Flex, MenuItem, MenuList, MenuListProps } from "@chakra-ui/react"
import { FC } from "react"

import { Network, ColorStatus } from "../../../../shared/network"
import { StatusIndicator } from "../../../components/StatusIndicator"

export interface NetworkSwitcherListProps extends MenuListProps {
  currentNetwork: Network
  allNetworks: (Network & { status: ColorStatus })[]
  onChangeNetwork: (id: string) => void
}

export const NetworkSwitcherList: FC<NetworkSwitcherListProps> = ({
  currentNetwork,
  allNetworks,
  onChangeNetwork,
  ...rest
}) => {
  return (
    <MenuList {...rest}>
      {allNetworks.map(({ id, name, status, rpcUrl, readonly }) => {
        const isCurrent = id === currentNetwork.id
        const extraProps = isCurrent ? buttonHoverStyle : {}
        return (
          <MenuItem
            key={id}
            onClick={() => onChangeNetwork(id)}
            data-testid={name}
            {...extraProps}
            data-group
          >
            <Flex ml={"auto"} justifyContent={"flex-end"} alignItems={"center"}>
              <Flex
                direction={"column"}
                alignItems={"flex-end"}
                textAlign={"right"}
                mr={2}
              >
                <B3
                  sx={{
                    color: "neutrals.100",
                    _groupHover: { color: "white" },
                  }}
                  maxW={45}
                  overflow="hidden"
                  whiteSpace="nowrap"
                  textOverflow="ellipsis"
                >
                  {name}
                </B3>
                {rpcUrl && !readonly && (
                  <L2
                    sx={{
                      color: "neutrals.100",
                      _groupHover: { color: "white" },
                    }}
                    maxW={45}
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                  >
                    {rpcUrl}
                  </L2>
                )}
              </Flex>
              <StatusIndicator status={status} />
            </Flex>
          </MenuItem>
        )
      })}
    </MenuList>
  )
}
