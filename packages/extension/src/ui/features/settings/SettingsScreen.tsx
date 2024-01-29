import {
  BarCloseButton,
  Button,
  CellStack,
  NavigationContainer,
  NavigationContainerProps,
  SpacerCell,
  icons,
} from "@argent/ui"
import { Center, Flex } from "@chakra-ui/react"
import { FC, ReactEventHandler } from "react"

import { isPrivacySettingsEnabled } from "../../../shared/settings"
import { routes } from "../../routes"
import { Account } from "../accounts/Account"
import { AccountListScreenItemContainer } from "../accounts/AccountListScreenItemContainer"
import { ClickableShieldBanner } from "../accounts/ClickableShieldBanner"
import { DapplandFooter } from "./ui/DapplandFooter"
import {
  SettingsMenuItem,
  SettingsMenuItemGroup,
  SettingsMenuItemLink,
} from "./ui/SettingsMenuItem"
import { SupportFooter } from "./ui/SupportFooter"
import { formatTruncatedString } from "@argent/shared"

const {
  LockIcon,
  AddressBookIcon,
  CodeIcon,
  ExpandIcon,
  ExtendedIcon,
  LinkIcon,
  ShieldIcon,
  EmailIcon,
  ChevronRightIcon,
  PreferencesIcon,
} = icons

interface SettingsScreenProps extends NavigationContainerProps {
  onBack: ReactEventHandler
  onLock: ReactEventHandler
  onNavigateToAccount: ReactEventHandler
  account?: Account
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
              <Flex direction={"column"} w={"full"} gap={"1px"}>
                <AccountListScreenItemContainer
                  account={account}
                  clickNavigateSettings
                  borderBottomRadius={
                    shouldDisplayGuardianBanner ? 0 : "undefined"
                  }
                />
                {shouldDisplayGuardianBanner && (
                  <ClickableShieldBanner address={account.address} />
                )}
              </Flex>
              <SpacerCell />
            </>
          )}
          <SettingsMenuItemGroup>
            <SettingsMenuItemLink
              leftIcon={<PreferencesIcon />}
              to={routes.settingsPreferences(returnTo)}
              title="Preferences"
            />
            {isPrivacySettingsEnabled && (
              <SettingsMenuItemLink
                leftIcon={<ShieldIcon />}
                to={routes.settingsPrivacy(returnTo)}
                title="Security & privacy"
              />
            )}
          </SettingsMenuItemGroup>
          <SettingsMenuItemGroup>
            <SettingsMenuItemLink
              leftIcon={<AddressBookIcon />}
              to={routes.settingsAddressBook()}
              title="Address book"
            />
            <SettingsMenuItemLink
              leftIcon={<LinkIcon />}
              to={routes.settingsDappConnectionsAccountList()}
              title="Connected dapps"
            />
          </SettingsMenuItemGroup>
          <SettingsMenuItemLink
            leftIcon={<CodeIcon />}
            to={routes.settingsDeveloper()}
            title="Developer settings"
          />
          <SettingsMenuItemGroup>
            {!extensionIsInTab && (
              <SettingsMenuItem
                leftIcon={<ExtendedIcon />}
                rightIcon={<ExpandIcon />}
                onClick={openExtensionInTab}
                title="Extended view"
              />
            )}
            <SettingsMenuItem
              leftIcon={<LockIcon />}
              title="Lock wallet"
              onClick={onLock}
            />
          </SettingsMenuItemGroup>
          <DapplandFooter />
          <SupportFooter />
        </CellStack>
      </NavigationContainer>
      {isSignedIn ? (
        <Center
          borderTop="1px solid"
          borderTopColor="border"
          background="bg"
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
            leftIcon={<EmailIcon />}
            rightIcon={<ChevronRightIcon />}
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
          background="bg"
          boxShadow="menu"
        >
          <Button
            onClick={onSignIn}
            size="md"
            colorScheme="transparent"
            color="white"
            w="xl"
            bgColor="neutrals.800"
            borderRadius="lg"
            margin={4}
            leftIcon={<EmailIcon />}
          >
            {verifiedEmail ? "Log in to Argent" : "Sign in to Argent"}
          </Button>
        </Center>
      )}
    </>
  )
}
