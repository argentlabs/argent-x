import {
  B2,
  BarBackButton,
  CellStack,
  NavigationContainer,
  SpacerCell,
  icons,
} from "@argent/ui"
import { Flex, Text } from "@chakra-ui/react"
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
import { SupportFooter } from "./SupportFooter"

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
        <CellStack>
          {account && (
            <>
              <AccountListScreenItem account={account} clickNavigateSettings />
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

          <SupportFooter />
        </CellStack>
        <Link onClick={stopSession} to={routes.lockScreen()}>
          <SpacerCell
            borderTop="solid 1px"
            borderTopColor="neutrals.700"
            h="4"
          />
          <Flex
            py={2}
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
          <SpacerCell h="4" />
        </Link>
      </NavigationContainer>
    </>
  )
}
