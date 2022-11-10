import { B2, BarBackButton, NavigationContainer, icons } from "@argent/ui"
import { Box, Flex, Stack, Text } from "@chakra-ui/react"
import { FC } from "react"
import { useNavigate } from "react-router-dom"
import { useLocation } from "react-router-dom"
import { Link } from "react-router-dom"
import styled from "styled-components"

import { isPrivacySettingsEnabled } from "../../../shared/settings"
import { Button } from "../../components/Button"
import { routes } from "../../routes"
import { stopSession } from "../../services/backgroundSessions"
import { H2 } from "../../theme/Typography"
import { AccountListScreenItem } from "../accounts/AccountListScreenItem"
import { useAccount, useSelectedAccountStore } from "../accounts/accounts.state"
import { useExtensionIsInTab, useOpenExtensionInTab } from "../browser/tabs"
import { SettingsMenuItem } from "./SettingsMenuItem"

const {
  LockIcon,
  AddressBookIcon,
  CodeIcon,
  ExpandIcon,
  ExtendedIcon,
  LinkIcon,
  PasswordIcon,
  ShieldIcon,
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

  ${Button} {
    margin-top: 10px;
  }

  hr {
    border: none;
    height: 1px;
    background-color: ${({ theme }) => theme.bg2};
  }
`

export const SettingsScreen: FC = () => {
  const openExtensionInTab = useOpenExtensionInTab()
  const extensionIsInTab = useExtensionIsInTab()
  const { pathname: returnTo } = useLocation()
  const navigate = useNavigate()
  const { selectedAccount } = useSelectedAccountStore()
  const account = useAccount(selectedAccount)
  return (
    <>
      <NavigationContainer
        leftButton={<BarBackButton onClick={() => navigate(-1)} />}
        title={"Settings"}
      >
        <Box mx="4" my="4">
          {account && <AccountListScreenItem account={account} />}
        </Box>
        <Stack direction="column" mx="4" h="60vh">
          {/*   <SettingsMenuItem
          onClick={stopSession}
          to={routes.lockScreen()}
          title="Lock wallet"
        /> */}

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
            leftIcon={<AddressBookIcon />}
            to={routes.settingsAddressbook()}
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
            title="Show recovery phrase"
          />

          {isPrivacySettingsEnabled && (
            <SettingsMenuItem
              leftIcon={<ShieldIcon />}
              to={routes.settingsPrivacy()}
              title="Privacy"
            />
          )}

          <SettingsMenuItem
            leftIcon={<CodeIcon />}
            to={routes.settingsDeveloper()}
            title="Developer settings"
          />
        </Stack>
      </NavigationContainer>
      <Link onClick={stopSession} to={routes.lockScreen()}>
        <Flex
          py={6}
          gap={2}
          cursor="pointer"
          justifyContent="center"
          alignItems="center"
          color="white50"
        >
          <Text fontSize="base">
            <LockIcon />
          </Text>
          <B2>Lock wallet</B2>
        </Flex>
      </Link>
    </>
  )
}
