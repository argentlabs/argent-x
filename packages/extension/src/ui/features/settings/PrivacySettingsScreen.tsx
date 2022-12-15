import { BarBackButton, NavigationContainer, Switch } from "@argent/ui"
import { FC } from "react"

import { settingsStore } from "../../../shared/settings"
import { useKeyValueStorage } from "../../../shared/storage/hooks"
import { P, SettingsItem, SettingsScreenWrapper, Title } from "./SettingsScreen"

export const PrivacySettingsScreen: FC = () => {
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
    <NavigationContainer leftButton={<BarBackButton />} title={"Privacy"}>
      <SettingsScreenWrapper>
        <hr />
        <SettingsItem>
          <Title>
            <span>Use Argent services</span>
            <Switch
              colorScheme="primary"
              isChecked={privacyUseArgentServices}
              onChange={() =>
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
              onChange={() =>
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
            <span>Share anonymised data with Argent</span>
            <Switch
              colorScheme="primary"
              isChecked={privacyShareAnalyticsData}
              onChange={() =>
                settingsStore.set(
                  "privacyShareAnalyticsData",
                  !privacyShareAnalyticsData,
                )
              }
            />
          </Title>
          <P>
            This helps the Argent team to identify issues, prioritise features
            and build a better product without compromising your privacy
          </P>
        </SettingsItem>
      </SettingsScreenWrapper>
    </NavigationContainer>
  )
}
