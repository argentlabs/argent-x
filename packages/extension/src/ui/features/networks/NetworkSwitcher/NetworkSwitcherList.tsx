import { B3, L2 } from "@argent/ui"
import { Flex, MenuItem, MenuList } from "@chakra-ui/react"
import { FC } from "react"

import { Network } from "../../../../shared/network"
import {
  StatusIndicator,
  mapNetworkStatusToColor,
} from "../../../components/StatusIndicator"

interface NetworkSwitcherListProps {
  currentNetwork: Network
  allNetworks: Network[]
  onChangeNetwork: (id: string) => void
}

export const NetworkSwitcherList: FC<NetworkSwitcherListProps> = ({
  currentNetwork,
  allNetworks,
  onChangeNetwork,
}) => {
  return (
    <MenuList>
      {allNetworks.map(({ id, name, baseUrl, status }) => {
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
            <Flex
              ml={"auto"}
              justifyContent={"flex-end"}
              alignItems={"center"}
              pointerEvents={"none"}
            >
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
                <L2
                  sx={{
                    color: "neutrals.400",
                    _groupHover: { color: "neutrals.300" },
                  }}
                  noOfLines={1}
                >
                  {baseUrl}
                </L2>
              </Flex>
              <StatusIndicator color={mapNetworkStatusToColor(status)} />
            </Flex>
          </MenuItem>
        )
      })}
    </MenuList>
  )
}
