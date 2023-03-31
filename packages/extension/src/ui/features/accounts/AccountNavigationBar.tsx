import {
  BarIconButton,
  NavigationBar,
  NavigationBarProps,
  icons,
} from "@argent/ui"
import { Button, Flex, Text } from "@chakra-ui/react"
import { FC, useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { routes, useCurrentPathnameWithQuery } from "../../routes"
import { NetworkSwitcher } from "../networks/NetworkSwitcher"
import { useSelectedAccount } from "./accounts.state"

const { SettingsIcon, DropdownDownIcon, ArgentShieldIcon } = icons

export interface AccountNavigationBarProps
  extends Pick<NavigationBarProps, "scroll"> {
  showAccountButton?: boolean
}

export const AccountNavigationBar: FC<AccountNavigationBarProps> = ({
  scroll,
  showAccountButton = true,
}) => {
  const account = useSelectedAccount()
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = useCurrentPathnameWithQuery()
  const isShield = Boolean(account?.guardian)

  const openAccountList = useCallback(() => {
    navigate(routes.accounts(location.pathname))
  }, [location.pathname, navigate])

  const showSettings = useCallback(() => {
    navigate(routes.settings(returnTo))
  }, [navigate, returnTo])

  const accountName = account && account.name
  return (
    <NavigationBar scroll={scroll}>
      {showAccountButton && account && (
        <Button
          aria-label={"Show account list"}
          colorScheme={"neutrals"}
          size={"2xs"}
          onClick={openAccountList}
        >
          {isShield && (
            <Text fontSize={"2xs"} mr={1}>
              <ArgentShieldIcon />
            </Text>
          )}
          <Text noOfLines={1} maxW={"180px"}>
            {accountName}
          </Text>
          <Text fontSize={"2xs"} ml={1}>
            <DropdownDownIcon />
          </Text>
        </Button>
      )}
      <Flex ml={"auto"}>
        <NetworkSwitcher />
        <BarIconButton
          ml={1}
          aria-label="Show settings"
          onClick={showSettings}
          colorScheme={"neutrals"}
        >
          <SettingsIcon />
        </BarIconButton>
      </Flex>
    </NavigationBar>
  )
}
