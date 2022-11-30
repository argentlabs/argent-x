import {
  BarIconButton,
  NavigationBar,
  NavigationBarProps,
  icons,
} from "@argent/ui"
import { Button, Flex, Text } from "@chakra-ui/react"
import { FC, useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { routes } from "../../routes"
import { NetworkSwitcher } from "../networks/NetworkSwitcher"
import { getAccountName, useAccountMetadata } from "./accountMetadata.state"
import { useSelectedAccount } from "./accounts.state"

const { SettingsIcon, DropdownDownIcon } = icons

export interface AccountNavigationBarProps
  extends Pick<NavigationBarProps, "scroll"> {
  showAccountButton?: boolean
}

export const AccountNavigationBar: FC<AccountNavigationBarProps> = ({
  scroll,
  showAccountButton = true,
}) => {
  const { accountNames } = useAccountMetadata()
  const account = useSelectedAccount()
  const navigate = useNavigate()
  const location = useLocation()

  const openAccountList = useCallback(() => {
    navigate(routes.accounts(location.pathname))
  }, [location.pathname, navigate])

  const showSettings = useCallback(() => {
    navigate(routes.settings())
  }, [navigate])

  const accountName = account && getAccountName(account, accountNames)
  return (
    <NavigationBar scroll={scroll}>
      {showAccountButton && account && (
        <Button
          aria-label={"Show account list"}
          colorScheme={"neutrals"}
          size={"2xs"}
          onClick={openAccountList}
        >
          <Text noOfLines={1}>{accountName}</Text>
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
