import { icons } from "@argent/ui"
import { Button, Text } from "@chakra-ui/react"
import { FC, useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import {
  BarIconButton,
  NavigationBar,
  NavigationBarProps,
} from "../../components/NavigationBar"
import { routes } from "../../routes"
import { NetworkSwitcher } from "../networks/NetworkSwitcher"
import { getAccountName, useAccountMetadata } from "./accountMetadata.state"
import { useSelectedAccount } from "./accounts.state"

const { SettingsIcon, DropdownDownIcon, DropdownUpIcon } = icons

export type AccountHeaderProps = Pick<NavigationBarProps, "scroll">

export const AccountHeader: FC<AccountHeaderProps> = ({ scroll }) => {
  const { accountNames } = useAccountMetadata()
  const account = useSelectedAccount()
  const navigate = useNavigate()
  const location = useLocation()

  const isAccountListScreen = location.pathname === routes.accounts()

  const openAccountList = useCallback(() => {
    navigate(routes.accounts(location.pathname))
  }, [location.pathname, navigate])

  const showSettings = useCallback(() => {
    navigate(routes.settings())
  }, [navigate])

  if (!account) {
    return <></>
  }
  const accountName = getAccountName(account, accountNames)
  return (
    <NavigationBar scroll={scroll}>
      <Button
        aria-label={isAccountListScreen ? "Show account" : "Show account list"}
        colorScheme={"neutrals800"}
        size={"2xs"}
        mr={"auto"}
        onClick={openAccountList}
      >
        <Text noOfLines={1}>{accountName}</Text>
        <Text fontSize={"sm"} ml={1}>
          {isAccountListScreen ? <DropdownUpIcon /> : <DropdownDownIcon />}
        </Text>
      </Button>
      <NetworkSwitcher />
      <BarIconButton aria-label="Show settings" onClick={showSettings}>
        <SettingsIcon />
      </BarIconButton>
    </NavigationBar>
  )
}
