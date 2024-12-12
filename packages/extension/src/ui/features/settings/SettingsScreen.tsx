import { formatTruncatedString } from "@argent/x-shared"
import type { NavigationContainerProps } from "@argent/x-ui"
import {
  BarCloseButton,
  Button,
  CellStack,
  HeaderCell,
  icons,
  NavigationContainer,
  SpacerCell,
} from "@argent/x-ui"
import { Center, Flex } from "@chakra-ui/react"
import type { FC, ReactEventHandler } from "react"

import { isPrivacySettingsEnabled } from "../../../shared/settings"
import { routes } from "../../../shared/ui/routes"
import { IS_DEV } from "../../../shared/utils/dev"
import type { WalletAccount } from "../../../shared/wallet.model"
import { AccountListScreenItemContainer } from "../accounts/AccountListScreenItemContainer"
import { ClickableSmartAccountBanner } from "../accounts/ClickableSmartAccountBanner"
import { DapplandFooter } from "./ui/DapplandFooter"
import {
  SettingsMenuItem,
  SettingsMenuItemGroup,
  SettingsMenuItemLink,
} from "./ui/SettingsMenuItem"
import { SupportFooter } from "./ui/SupportFooter"

const {
  LockPrimaryIcon,
  ExpandIcon,
  LinkPrimaryIcon,
  MessageSecondaryIcon,
  ChevronRightSecondaryIcon,
  FilterSecondaryIcon,
  ShieldSecondaryIcon,
  AddressBookIcon,
  CodeIcon,
  ExtendedIcon,
} = icons

interface SettingsScreenProps extends NavigationContainerProps {
  onBack: ReactEventHandler
  onLock: ReactEventHandler
  onNavigateToAccount: ReactEventHandler
  account?: WalletAccount
  shouldDisplayGuardianBanner: boolean
  isSignedIn: boolean
  onSignIn: ReactEventHandler
  extensionIsInTab: boolean
  openExtensionInTab: ReactEventHandler
  returnTo: string
  verifiedEmail?: string | null
}

export const SettingsScreen: FC<SettingsScreenProps> = ({
  onBack,
  onLock,
  onNavigateToAccount,
  account,
  shouldDisplayGuardianBanner,
  isSignedIn,
  onSignIn,
  extensionIsInTab,
  openExtensionInTab,
  returnTo,
  verifiedEmail,
}) => {
  return (
    <>
      <NavigationContainer
        rightButton={<BarCloseButton onClick={onBack} />}
        title={"Settings"}
        scrollKey={"settings/SettingsScreen"}
      >
        <CellStack>
          {account && (
            <>
              <HeaderCell>Account settings</HeaderCell>
              <Flex direction={"column"} w={"full"} gap={"1px"}>
                <AccountListScreenItemContainer
                  account={account}
                  clickNavigateSettings
                  borderBottomRadius={
                    shouldDisplayGuardianBanner ? 0 : "undefined"
                  }
                  showRightElements={false}
                />
                {shouldDisplayGuardianBanner && (
                  <ClickableSmartAccountBanner account={account} />
                )}
              </Flex>
            </>
          )}
          <HeaderCell>Global settings</HeaderCell>
          <SettingsMenuItemGroup>
            <SettingsMenuItemLink
              leftIcon={<FilterSecondaryIcon />}
              to={routes.settingsPreferences(returnTo)}
              title="Preferences"
            />
            <SettingsMenuItemLink
              leftIcon={<ShieldSecondaryIcon />}
              to={routes.settingsSecurityAndRecovery(returnTo)}
              title="Security & recovery"
            />
            {isPrivacySettingsEnabled && (
              <SettingsMenuItemLink
                leftIcon={<LockPrimaryIcon />}
                to={routes.settingsPrivacy(returnTo)}
                title="Privacy"
              />
            )}
            <SettingsMenuItemLink
              leftIcon={<LinkPrimaryIcon />}
              to={routes.settingsDappConnectionsAccountList()}
              title="Authorised dapps"
            />
          </SettingsMenuItemGroup>
          <SpacerCell />
          <SettingsMenuItemLink
            leftIcon={<CodeIcon />}
            to={routes.settingsAdvanced()}
            title="Advanced settings"
          />
          <SpacerCell />
          <SettingsMenuItem
            leftIcon={<LockPrimaryIcon />}
            title="Lock wallet"
            onClick={onLock}
          />
          {IS_DEV && (
            <>
              <HeaderCell>Local development settings</HeaderCell>
              <SettingsMenuItemGroup>
                {!extensionIsInTab && (
                  <SettingsMenuItem
                    leftIcon={<ExtendedIcon />}
                    rightIcon={<ExpandIcon />}
                    onClick={openExtensionInTab}
                    title="Extended view"
                  />
                )}
                <SettingsMenuItemLink
                  leftIcon={<CodeIcon />}
                  to={routes.settingsClearLocalStorage()}
                  title="Clear local storage"
                />
                <SettingsMenuItemLink
                  leftIcon={<AddressBookIcon />}
                  to={routes.settingsAddressBook()}
                  title="Address book"
                />
              </SettingsMenuItemGroup>
            </>
          )}
        </CellStack>
        <DapplandFooter />
        <SupportFooter mb={4} />
      </NavigationContainer>
      {isSignedIn ? (
        <Center
          borderTop="1px solid"
          borderTopColor="border"
          background="surface-default"
          boxShadow="menu"
        >
          <Button
            onClick={onNavigateToAccount}
            size="md"
            colorScheme="transparent"
            color="white"
            w="xl"
            bgColor="neutrals.800"
            borderRadius="lg"
            margin={4}
            leftIcon={<MessageSecondaryIcon />}
            rightIcon={<ChevronRightSecondaryIcon />}
            textOverflow={"ellipsis"}
            overflow={"hidden"}
          >
            {verifiedEmail
              ? formatTruncatedString(verifiedEmail, 28)
              : "No email"}
          </Button>
        </Center>
      ) : (
        <Center
          borderTop="1px solid"
          borderTopColor="border"
          background="surface-default"
          boxShadow="menu"
        >
          <Button
            onClick={onSignIn}
            w={{ base: "full", sm: "xl" }}
            borderRadius="lg"
            margin={4}
            leftIcon={<MessageSecondaryIcon fontSize="xl" />}
          >
            {verifiedEmail ? "Log in to Argent" : "Sign in to Argent"}
          </Button>
        </Center>
      )}
    </>
  )
}
