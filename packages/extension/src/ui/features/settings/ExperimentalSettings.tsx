import { BarBackButton, NavigationContainer, Switch } from "@argent/ui"
import { FC } from "react"

import { settingsStore } from "../../../shared/settings"
import { useKeyValueStorage } from "../../../shared/storage/hooks"
import { P, SettingsItem, SettingsScreenWrapper, Title } from "./SettingsScreen"

export const PrivacyExperimentalSettings: FC = () => {
  const experimentalAllowChooseAccount = useKeyValueStorage(
    settingsStore,
    "experimentalAllowChooseAccount",
  )

  return (
    <NavigationContainer leftButton={<BarBackButton />} title={"Experimental"}>
      <SettingsScreenWrapper>
        <SettingsItem>
          <Title>
            <span>Show account implementation picker</span>
            <Switch
              isChecked={experimentalAllowChooseAccount}
              onChange={() =>
                settingsStore.set(
                  "experimentalAllowChooseAccount",
                  !experimentalAllowChooseAccount,
                )
              }
            />
          </Title>
          <P>
            Shows a new menu item in the account settings, which allows a user
            to switch account implementation for an account.
          </P>
        </SettingsItem>
      </SettingsScreenWrapper>
    </NavigationContainer>
  )
}
