import {
  BarCloseButton,
  BarIconButton,
  Button,
  CellStack,
  NavigationContainer,
  SpacerCell,
  icons,
} from "@argent/ui"
import { Box, Center } from "@chakra-ui/react"
import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { isPrivacySettingsEnabled } from "../../../shared/settings"
import { routes, useCurrentPathnameWithQuery } from "../../routes"
import { useStopSession } from "../../services/useStopSession"
import { H2 } from "../../theme/Typography"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { AccountListScreenItemContainer } from "../accounts/AccountListScreenItemContainer"
import { useAccount } from "../accounts/accounts.state"
import { useExtensionIsInTab, useOpenExtensionInTab } from "../browser/tabs"
import { DapplandFooter } from "./DapplandFooter"
import { SettingsMenuItem } from "./SettingsMenuItem"
import { SupportFooter } from "./SupportFooter"
import { useShieldVerifiedEmail } from "../shield/useShieldVerifiedEmail"
import { useArgentAccountTokenExpired } from "../argentAccount/hooks/useArgentAccountTokenExpired"
import { formatTruncatedString } from "../../services/addresses"
import { ClickableShieldBanner } from "../accounts/ClickableShieldBanner"
import { useNavigateReturnToOrBack } from "../../hooks/useNavigateReturnTo"

const {
  LockIcon,
  AddressBookIcon,
  CodeIcon,
  ExpandIcon,
  ExtendedIcon,
  LinkIcon,
  PasswordIcon,
  ShieldIcon,
  EmailIcon,
  ChevronRightIcon,
} = icons

export const Title = styled.h3`
  font-weight: 600;
  font-size: 17px;
  line-height: 22px;
  color: ${({ theme }) => theme.text1};

  display: flex;
  align-items: center;
  justify-content: space-between;

  svg {
    color: ${({ theme }) => theme.text2};
    font-size: 12px;
  }
`

export const P = styled.p`
  font-size: 15px;
  color: ${({ theme }) => theme.text2};
  margin-top: 16px;
`

export const SettingsItem = styled.div`
  padding: 24px 32px;
`

// TODO: remove this when we have a proper settings page
export const SettingsScreenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 0 24px 0;

  ${H2} {
    margin: 0 32px 32px 32px;
  }

  hr {
    border: none;
    height: 1px;
    background-color: ${({ theme }) => theme.bg2};
  }
`

export const SettingsScreen: FC = () => {
  const onBack = useNavigateReturnToOrBack()
  const openExtensionInTab = useOpenExtensionInTab()
  const extensionIsInTab = useExtensionIsInTab()
  const selectedAccount = useView(selectedAccountView)
  const returnTo = useCurrentPathnameWithQuery()
  const account = useAccount(selectedAccount)
  const navigate = useNavigate()
  const stopSession = useStopSession()
  const verifiedEmail = useShieldVerifiedEmail()
  const { data: isArgentAccountTokenExpired } = useArgentAccountTokenExpired()

  const isSignedIn = verifiedEmail && !isArgentAccountTokenExpired
  const handleSignin = () => {
    navigate(
      routes.argentAccountEmail(
        selectedAccount?.address,
        "argentAccount",
        returnTo,
      ),
    )
  }
  const navigateToAccount = () => {
    navigate(routes.argentAccountLoggedIn(selectedAccount?.address))
  }

  const shouldDisplayGuardianBanner =
    account && !account.guardian && account.type !== "multisig"

  return (
    <>
      <NavigationContainer
        rightButton={<BarCloseButton onClick={onBack} />}
        title={"Settings"}
        leftButton={
          <BarIconButton
            onClick={() => void stopSession(true)}
            aria-label="Lock wallet"
          >
            <LockIcon />
          </BarIconButton>
        }
        scrollKey={"settings/SettingsScreen"}
      >
        <CellStack>
          {account && (
            <>
              <Box w={"full"}>
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
              </Box>
              <SpacerCell />
            </>
          )}
          {!extensionIsInTab && (
            <SettingsMenuItem
              leftIcon={<ExtendedIcon />}
              rightIcon={<ExpandIcon />}
              to={routes.settings()}
              onClick={openExtensionInTab}
              title="Extended view"
            />
          )}
          <SettingsMenuItem
            leftIcon={<EmailIcon />}
            to={
              isSignedIn
                ? routes.argentAccountEmailPreferences(returnTo)
                : routes.argentAccountEmail(
                    selectedAccount?.address,
                    "emailPreferences",
                    returnTo,
                  )
            }
            title="Email notifications"
          />

          <SettingsMenuItem
            leftIcon={<AddressBookIcon />}
            to={routes.settingsAddressBook()}
            title="Address book"
          />

          <SettingsMenuItem
            leftIcon={<LinkIcon />}
            to={routes.settingsDappConnections()}
            title="Connected dapps"
          />

          <SettingsMenuItem
            leftIcon={<PasswordIcon />}
            to={routes.settingsSeed(returnTo)}
            title="Recovery phrase"
          />

          <SettingsMenuItem
            leftIcon={<CodeIcon />}
            to={routes.settingsDeveloper()}
            title="Developer settings"
          />

          {isPrivacySettingsEnabled && (
            <SettingsMenuItem
              leftIcon={<ShieldIcon />}
              to={routes.settingsPrivacy()}
              title="Privacy"
            />
          )}
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
            onClick={navigateToAccount}
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
            {formatTruncatedString(verifiedEmail, 28)}
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
            onClick={handleSignin}
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
