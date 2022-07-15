import { FC } from "react"

import { ISettingsStorage } from "../../../shared/settings"
import { IconBar } from "../../components/IconBar"
import { LazyInitialisedIOSSwitch } from "../../components/IOSSwitch"
import { useBackgroundSettingsValue } from "../../services/useBackgroundSettingsValue"
import { H2 } from "../../theme/Typography"
import { P, SettingsItem, SettingsScreenWrapper, Title } from "./SettingsScreen"

const ANALYTICS_UI_ENABLED = false

export const PrivacySettingsScreen: FC = () => {
  const {
    initialised: privacyUseArgentServicesInitialised,
    value: privacyUseArgentServicesValue,
    setValue: setPrivacyUseArgentServicesValue,
  } = useBackgroundSettingsValue<ISettingsStorage["privacyUseArgentServices"]>(
    "privacyUseArgentServices",
  )

  const {
    initialised: privacyShareAnalyticsDataInitialised,
    value: privacyShareAnalyticsDataValue,
    setValue: setPrivacyShareAnalyticsDataValue,
  } = useBackgroundSettingsValue<ISettingsStorage["privacyShareAnalyticsData"]>(
    "privacyShareAnalyticsData",
  )

  const {
    initialised: privacyErrorReportingInitialised,
    value: privacyErrorReportingValue,
    setValue: setPrivacyErrorReportingValue,
  } = useBackgroundSettingsValue<ISettingsStorage["privacyErrorReporting"]>(
    "privacyErrorReporting",
  )

  return (
    <>
      <IconBar back />
      <SettingsScreenWrapper>
        <H2>Privacy</H2>
        <SettingsItem>
          <Title>
            <span>Use Argent services</span>
            <LazyInitialisedIOSSwitch
              initialised={privacyUseArgentServicesInitialised}
              checked={privacyUseArgentServicesValue}
              onClick={() =>
                setPrivacyUseArgentServicesValue(!privacyUseArgentServicesValue)
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
            <LazyInitialisedIOSSwitch
              initialised={privacyErrorReportingInitialised}
              checked={privacyErrorReportingValue}
              onClick={() =>
                setPrivacyErrorReportingValue(!privacyErrorReportingValue)
              }
            />
          </Title>
          <P>Automatically share crash logs with Argent</P>
        </SettingsItem>
        <hr />
        {ANALYTICS_UI_ENABLED && (
          <>
            <SettingsItem>
              <Title>
                <span>Share analytics data</span>
                <LazyInitialisedIOSSwitch
                  initialised={privacyShareAnalyticsDataInitialised}
                  checked={privacyShareAnalyticsDataValue}
                  onClick={() =>
                    setPrivacyShareAnalyticsDataValue(
                      !privacyShareAnalyticsDataValue,
                    )
                  }
                />
              </Title>
              <P>
                This helps the Argent team to identify issues, prioritize
                features and build a better product
              </P>
            </SettingsItem>
            <hr />
          </>
        )}
      </SettingsScreenWrapper>
    </>
  )
}
