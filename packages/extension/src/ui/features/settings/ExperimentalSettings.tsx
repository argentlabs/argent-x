import { FC } from "react"

import { settingsStore } from "../../../shared/settings"
import { useKeyValueStorage } from "../../../shared/storage/hooks"
import { IconBar } from "../../components/IconBar"
import IOSSwitch from "../../components/IOSSwitch"
import { H2 } from "../../theme/Typography"
import { P, SettingsItem, SettingsScreenWrapper, Title } from "./SettingsScreen"

export const PrivacyExperimentalSettings: FC = () => {
  const experimentalPluginAccount = useKeyValueStorage(
    settingsStore,
    "experimentalPluginAccount",
  )

  return (
    <>
      <IconBar back />
      <SettingsScreenWrapper>
        <H2>Experimental</H2>
        <SettingsItem>
          <Title>
            <span>Use Plugin Account</span>
            <IOSSwitch
              checked={experimentalPluginAccount}
              onClick={() =>
                settingsStore.set(
                  "experimentalPluginAccount",
                  !experimentalPluginAccount,
                )
              }
            />
          </Title>
          <P>Use the experimental Argent Plugin account on testnet</P>
        </SettingsItem>
      </SettingsScreenWrapper>
    </>
  )
}
