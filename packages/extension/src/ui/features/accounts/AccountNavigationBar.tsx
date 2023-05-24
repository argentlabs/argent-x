import { BarIconButton, NavigationBar, icons } from "@argent/ui"
import { Button, Flex, Text } from "@chakra-ui/react"
import { FC, ReactEventHandler } from "react"

import { NetworkSwitcherContainer } from "../networks/NetworkSwitcher/NetworkSwitcherContainer"
import { AccountNavigationBarContainerProps } from "./AccountNavigationBarContainer"

const { SettingsIcon, DropdownDownIcon, ArgentShieldIcon, MultisigIcon } = icons

interface AccountNavigationBarProps extends AccountNavigationBarContainerProps {
  accountName?: string
  isShield?: boolean
  isMultisig?: boolean
  onAccountList?: ReactEventHandler
  onSettings?: ReactEventHandler
}

export const AccountNavigationBar: FC<AccountNavigationBarProps> = ({
  accountName,
  isShield,
  isMultisig,
  onAccountList,
  onSettings,
  scroll,
  showAccountButton = true,
  showNetworkSwitcher = true,
}) => {
  return (
    <NavigationBar scroll={scroll}>
      {showAccountButton && (
        <Button
          aria-label={"Show account list"}
          colorScheme={"neutrals"}
          size={"2xs"}
          onClick={onAccountList}
        >
          {isShield && (
            <Text fontSize={"2xs"} mr={1}>
              <ArgentShieldIcon />
            </Text>
          )}
          {isMultisig && (
            <Text fontSize={"2xs"} mr={1}>
              <MultisigIcon />
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
        {showNetworkSwitcher && <NetworkSwitcherContainer />}
        <BarIconButton
          ml={1}
          aria-label="Show settings"
          onClick={onSettings}
          colorScheme={"neutrals"}
        >
          <SettingsIcon />
        </BarIconButton>
      </Flex>
    </NavigationBar>
  )
}
