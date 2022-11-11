import { B3, L2 } from "@argent/ui"
import {
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react"
import { FC, useCallback, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { NetworkStatus } from "../../../shared/network"
import { useAppState } from "../../app.state"
import {
  StatusIndicator,
  mapNetworkStatusToColor,
} from "../../components/StatusIndicator"
import { routes } from "../../routes"
import { autoSelectAccountOnNetwork } from "../accounts/switchAccount"
import { useNeedsToShowNetworkStatusWarning } from "./seenNetworkStatusWarning.state"
import { useNetwork, useNetworkStatuses, useNetworks } from "./useNetworks"

const valuesToShowNetwortWarning: Array<NetworkStatus> = ["degraded", "error"]

interface NetworkSwitcherProps {
  disabled?: boolean
}

export const NetworkSwitcher: FC<NetworkSwitcherProps> = ({ disabled }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { switcherNetworkId } = useAppState()
  const allNetworks = useNetworks()
  const currentNetwork = useNetwork(switcherNetworkId)
  const { networkStatuses } = useNetworkStatuses()
  const [needsToShowNetworkStatusWarning] = useNeedsToShowNetworkStatusWarning()
  const currentNetworkStatus = networkStatuses[currentNetwork.id]

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

  return (
    <Menu>
      <MenuButton
        aria-label="Selected network"
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
      <MenuList>
        {allNetworks.map(({ id, name, baseUrl }) => {
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
                <StatusIndicator
                  color={mapNetworkStatusToColor(networkStatuses[id])}
                />
              </Flex>
            </MenuItem>
          )
        })}
      </MenuList>
    </Menu>
  )
}
