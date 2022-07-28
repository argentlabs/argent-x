import { FC } from "react"

import {
  ISettingsStorage,
  setSetting,
  settingsStorage,
} from "../../../shared/settings"
import { useObjectStorage } from "../../../shared/storage/hooks"
import { IconBar } from "../../components/IconBar"
import IOSSwitch from "../../components/IOSSwitch"
import { H2 } from "../../theme/Typography"
import { P, SettingsItem, SettingsScreenWrapper, Title } from "./SettingsScreen"

const ANALYTICS_UI_ENABLED = false

export const PrivacySettingsScreen: FC = () => {
  const {
    privacyUseArgentServices,
    privacyErrorReporting,
    privacyShareAnalyticsData,
  } = useObjectStorage<ISettingsStorage>(settingsStorage)

  return (
    <>
      <IconBar back />
      <SettingsScreenWrapper>
        <H2>Privacy</H2>
        <SettingsItem>
          <Title>
            <span>Use Argent services</span>
            <IOSSwitch
              checked={privacyUseArgentServices}
              onClick={async () =>
                await setSetting(
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
              checked={privacyErrorReporting}
              onClick={async () =>
                await setSetting(
                  "privacyErrorReporting",
                  !privacyErrorReporting,
                )
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
                <IOSSwitch
                  checked={privacyShareAnalyticsData}
                  onClick={async () =>
                    await setSetting(
                      "privacyShareAnalyticsData",
                      !privacyShareAnalyticsData,
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
