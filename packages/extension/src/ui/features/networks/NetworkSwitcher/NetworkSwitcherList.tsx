import { B3, L2 } from "@argent/ui"
import { Flex, MenuItem, MenuList, MenuListProps } from "@chakra-ui/react"
import { FC } from "react"

import { Network, NetworkStatus } from "../../../../shared/network"
import { StatusIndicator } from "../../../components/StatusIndicator"

export interface NetworkSwitcherListProps extends MenuListProps {
  currentNetwork: Network
  allNetworks: (Network & { status: NetworkStatus })[]
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
        return (
          <MenuItem
            key={id}
            onClick={() => onChangeNetwork(id)}
            data-testid={name}
            sx={
              isCurrent
                ? {
                    backgroundColor: "neutrals.600",
                  }
                : {}
            }
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
                >
                  {name}
                </B3>
                {rpcUrl && !readonly && (
                  <L2
                    sx={{
                      color: "neutrals.100",
                      _groupHover: { color: "white" },
                    }}
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
