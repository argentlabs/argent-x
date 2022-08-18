import { FC } from "react"

import { settingsStore } from "../../../shared/settings"
import { useKeyValueStorage } from "../../../shared/storage/hooks"
import { IconBar } from "../../components/IconBar"
import IOSSwitch from "../../components/IOSSwitch"
import { H2 } from "../../theme/Typography"
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
    <>
      <IconBar back />
      <SettingsScreenWrapper>
        <H2>Privacy</H2>
        <hr />
        <SettingsItem>
          <Title>
            <span>Use Argent services</span>
            <IOSSwitch
              checked={privacyUseArgentServices}
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
            <IOSSwitch
              checked={privacyAutomaticErrorReporting}
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
            <IOSSwitch
              checked={privacyShareAnalyticsData}
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
    </>
  )
}
