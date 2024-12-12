import { B3, buttonHoverStyle, L2 } from "@argent/x-ui"
import type { MenuListProps } from "@chakra-ui/react"
import { Flex, MenuItem, MenuList, Text } from "@chakra-ui/react"
import type { FC } from "react"

import type { Network, ColorStatus } from "../../../shared/network"
import { StatusIndicator } from "../../components/StatusIndicator"

export interface NetworkSwitcherListProps extends MenuListProps {
  networkId: string
  allNetworks: (Network & { status: ColorStatus })[]
  onChangeNetworkId: (networkId: string) => void
}

export const NetworkSwitcherList: FC<NetworkSwitcherListProps> = ({
  networkId,
  allNetworks,
  onChangeNetworkId,
  ...rest
}) => {
  return (
    <MenuList maxW="16em" {...rest}>
      {allNetworks.map(({ id, name, status, rpcUrl, readonly }) => {
        const isCurrent = id === networkId
        const extraProps = isCurrent ? buttonHoverStyle : {}
        return (
          <MenuItem
            data-group
            data-testid={name}
            key={id}
            onClick={() => onChangeNetworkId(id)}
            textAlign={"center"}
            flexDirection={"column"}
            overflow={"hidden"}
            color="text-secondary"
            {...extraProps}
          >
            <Flex
              alignItems={"center"}
              gap={1}
              overflow={"hidden"}
              maxWidth="full"
            >
              <B3
                maxWidth="full"
                overflow="hidden"
                whiteSpace="nowrap"
                textOverflow="ellipsis"
                color={isCurrent ? "text-primary" : undefined}
                transitionProperty={"common"}
                transitionDuration={"ultra-fast"}
                _groupHover={{
                  color: "text-primary",
                }}
              >
                {name}
              </B3>
              <StatusIndicator status={status} flexShrink={0} />
            </Flex>
            {rpcUrl && !readonly && (
              <L2
                as={Text}
                maxWidth="full"
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {rpcUrl}
              </L2>
            )}
          </MenuItem>
        )
      })}
    </MenuList>
  )
}
