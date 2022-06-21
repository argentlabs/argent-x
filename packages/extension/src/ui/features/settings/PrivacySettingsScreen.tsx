import { FC } from "react"

import { IconBar } from "../../components/IconBar"
import { LazyInitialisedIOSSwitch } from "../../components/IOSSwitch"
import { H2 } from "../../components/Typography"
import { P, SettingsItem, SettingsScreenWrapper, Title } from "./SettingsScreen"
import { useSettingsValue } from "./useSettingsValue"

const ANALYTICS_UI_ENABLED = false

export const PrivacySettingsScreen: FC = () => {
  const {
    initialised: privacyUseArgentServicesInitialised,
    value: privacyUseArgentServicesValue,
    setValue: setPrivacyUseArgentServicesValue,
  } = useSettingsValue("privacyUseArgentServices")

  const {
    initialised: privacyShareAnalyticsDataInitialised,
    value: privacyShareAnalyticsDataValue,
    setValue: setPrivacyShareAnalyticsDataValue,
  } = useSettingsValue("privacyShareAnalyticsData")

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
