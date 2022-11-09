import { BarBackButton, NavigationBar } from "@argent/ui"
import { Stack, chakra } from "@chakra-ui/react"
import { FC } from "react"
import { useNavigate } from "react-router-dom"
import { Link as RouterLink, useLocation } from "react-router-dom"
import styled from "styled-components"

import { isPrivacySettingsEnabled } from "../../../shared/settings"
import { Button } from "../../components/Button"
import { routes } from "../../routes"
import { stopSession } from "../../services/backgroundSessions"
import { H2 } from "../../theme/Typography"
import { useExtensionIsInTab, useOpenExtensionInTab } from "../browser/tabs"
import { SettingsMenuItem } from "./SettingsMenuItem"
import { SupportFooter } from "./SupportFooter"

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
  return (
    <>
      <NavigationBar
        leftButton={<BarBackButton onClick={() => navigate(-1)} />}
        title={"Settings"}
      />

      <Stack direction="column" mx="4">
        <SettingsMenuItem
          onClick={stopSession}
          to={routes.lockScreen()}
          title="Lock wallet"
        />

        {!extensionIsInTab && (
          <SettingsMenuItem
            to={routes.settings()}
            onClick={openExtensionInTab}
            title="Extended view"
          />
        )}

        <SettingsMenuItem
          to={routes.settingsAddressbook()}
          title="Address book"
        />

        <SettingsMenuItem
          to={routes.settingsDappConnections()}
          title="Reset dapp connections"
        />

        <SettingsMenuItem
          to={routes.settingsSeed(returnTo)}
          title="Show recovery phrase"
        />

        {isPrivacySettingsEnabled && (
          <SettingsMenuItem to={routes.settingsPrivacy()} title="Privacy" />
        )}
        <SettingsMenuItem
          to={routes.settingsDeveloper()}
          title="Developer settings"
        />

        <SupportFooter />
      </Stack>
    </>
  )
}
