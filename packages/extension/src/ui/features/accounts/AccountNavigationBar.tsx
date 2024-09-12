import {
  BarIconButton,
  L2,
  NavigationBar,
  iconsDeprecated,
  logosDeprecated,
} from "@argent/x-ui"
import { Button, Flex, Text } from "@chakra-ui/react"
import { FC } from "react"
import { NetworkSwitcherContainer } from "../networks/NetworkSwitcher/NetworkSwitcherContainer"
import { AccountNavigationBarProps } from "./accountNavigationBar.model"

const { SettingsIcon, DropdownDownIcon, SmartAccountActiveIcon, MultisigIcon } =
  iconsDeprecated

const { LedgerLogo } = logosDeprecated

export const AccountNavigationBar: FC<AccountNavigationBarProps> = ({
  accountName,
  isSmartAccount,
  isMultisig,
  isLedgerAccount,
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
          size={"2xs"}
          onClick={onAccountList}
        >
          {isSmartAccount && (
            <Text
              fontSize={"2xs"}
              mr={1}
              data-testid="smart-account-on-account-view"
            >
              <SmartAccountActiveIcon />
            </Text>
          )}
          {isMultisig && (
            <Text fontSize={"2xs"} mr={1}>
              <MultisigIcon />
            </Text>
          )}
          {isLedgerAccount && (
            <Text fontSize={"sm"} mr={1}>
              <LedgerLogo />
            </Text>
          )}
          <Text
            lineHeight="5"
            noOfLines={1}
            maxW={"90px"}
            style={{ textOverflow: "ellipsis" }}
          >
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
          <BarIconButton aria-label="Show settings" onClick={onSettings}>
            <SettingsIcon />
          </BarIconButton>
        )}
      </Flex>
    </NavigationBar>
  )
}
