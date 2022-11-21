import { BarBackButton, NavigationContainer, Switch } from "@argent/ui"
import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { settingsStore } from "../../../shared/settings"
import { useKeyValueStorage } from "../../../shared/storage/hooks"
import { P, SettingsItem, SettingsScreenWrapper, Title } from "./SettingsScreen"

export const PrivacySettingsScreen: FC = () => {
  const navigate = useNavigate()
  const privacyUseArgentServices = useKeyValueStorage(
    settingsStore,
    "privacyUseArgentServices",
  )

  const privacyAutomaticErrorReporting = useKeyValueStorage(
    settingsStore,
    "privacyAutomaticErrorReporting",
  )

  const privacyShareAnalyticsData = useKeyValueStorage(
    settingsStore,
    "privacyShareAnalyticsData",
  )

  return (
    <NavigationContainer
      leftButton={<BarBackButton onClick={() => navigate(-1)} />}
      title={"Privacy"}
    >
      <SettingsScreenWrapper>
        <hr />
        <SettingsItem>
          <Title>
            <span>Use Argent services</span>
            <Switch
              colorScheme="primary"
              isChecked={privacyUseArgentServices}
              onClick={() =>
                settingsStore.set(
                  "privacyUseArgentServices",
                  !privacyUseArgentServices,
                )
              }
            />
          </Title>
          <P>
            Use the Argent backend for token pricing, rich activity feed,
            transaction review & assessment
          </P>
        </SettingsItem>
        <hr />
        <SettingsItem>
          <Title>
            <span>Automatic Error Reporting</span>
            <Switch
              colorScheme="primary"
              isChecked={privacyAutomaticErrorReporting}
              onClick={() =>
                settingsStore.set(
                  "privacyAutomaticErrorReporting",
                  !privacyAutomaticErrorReporting,
                )
              }
            />
          </Title>
          <P>Automatically share crash logs with Argent</P>
        </SettingsItem>
        <hr />
        <SettingsItem>
          <Title>
            <span>Share analytics data</span>
            <Switch
              colorScheme="primary"
              isChecked={privacyShareAnalyticsData}
              onClick={() =>
                settingsStore.set(
                  "privacyShareAnalyticsData",
                  !privacyShareAnalyticsData,
                )
              }
            />
          </Title>
          <P>
            This helps the Argent team to identify issues, prioritize features
            and build a better product
          </P>
        </SettingsItem>
      </SettingsScreenWrapper>
    </NavigationContainer>
  )
}
