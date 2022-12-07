import { BarBackButton, NavigationContainer, Switch } from "@argent/ui"
import { FC } from "react"

import { settingsStore } from "../../../shared/settings"
import { useKeyValueStorage } from "../../../shared/storage/hooks"
import { P, SettingsItem, SettingsScreenWrapper, Title } from "./SettingsScreen"

export const PrivacyExperimentalSettings: FC = () => {
  const experimentalPluginAccount = useKeyValueStorage(
    settingsStore,
    "experimentalPluginAccount",
  )

  return (
    <NavigationContainer leftButton={<BarBackButton />} title={"Experimental"}>
      <SettingsScreenWrapper>
        <SettingsItem>
          <Title>
            <span>Use Plugin Account</span>
            <Switch
              isChecked={experimentalPluginAccount}
              onChange={() =>
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
    </NavigationContainer>
  )
}
