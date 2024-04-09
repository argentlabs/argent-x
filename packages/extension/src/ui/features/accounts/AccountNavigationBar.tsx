import { BarIconButton, L2, NavigationBar, icons } from "@argent/x-ui"
import { Button, Flex, Text } from "@chakra-ui/react"
import { FC } from "react"

import { NetworkSwitcherContainer } from "../networks/NetworkSwitcher/NetworkSwitcherContainer"
import { AccountNavigationBarProps } from "./accountNavigationBar.model"

const { SettingsIcon, DropdownDownIcon, ArgentShieldIcon, MultisigIcon } = icons

export const AccountNavigationBar: FC<AccountNavigationBarProps> = ({
  accountName,
  isShield,
  isMultisig,
  onAccountList,
  onSettings,
  scroll,
  showAccountButton = true,
  showNetworkSwitcher = true,
  showSettingsButton = true,
  envLabel,
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
            <Text fontSize={"2xs"} mr={1} data-testid="shield-on-account-view">
              <ArgentShieldIcon />
            </Text>
          )}
          {isMultisig && (
            <Text fontSize={"2xs"} mr={1}>
              <MultisigIcon />
            </Text>
          )}
          <Text lineHeight="5" noOfLines={1} maxW={"180px"}>
            {accountName}
          </Text>
          <Text fontSize={"2xs"} ml={1}>
            <DropdownDownIcon />
          </Text>
        </Button>
      )}

      <Flex ml={"auto"} gap={1} alignItems={"center"}>
        {envLabel && (
          <L2 color="text-secondary" pointerEvents={"none"} mr={1}>
            {envLabel}
          </L2>
        )}
        {showNetworkSwitcher && <NetworkSwitcherContainer />}
        {showSettingsButton && (
          <BarIconButton
            aria-label="Show settings"
            onClick={onSettings}
            colorScheme={"neutrals"}
          >
            <SettingsIcon />
          </BarIconButton>
        )}
      </Flex>
    </NavigationBar>
  )
}
