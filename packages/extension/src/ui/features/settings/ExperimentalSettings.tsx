import {
  BarBackButton,
  ButtonCell,
  CellStack,
  NavigationContainer,
  P4,
  Switch,
} from "@argent/ui"
import { FC } from "react"

import { settingsStore } from "../../../shared/settings"
import { useKeyValueStorage } from "../../../shared/storage/hooks"
import { SettingsScreenWrapper } from "./SettingsScreen"

export const PrivacyExperimentalSettings: FC = () => {
  const experimentalAllowChooseAccount = useKeyValueStorage(
    settingsStore,
    "experimentalAllowChooseAccount",
  )

  return (
    <NavigationContainer leftButton={<BarBackButton />} title={"Experimental"}>
      <SettingsScreenWrapper>
        <CellStack>
          <ButtonCell
            onClick={() =>
              settingsStore.set(
                "experimentalAllowChooseAccount",
                !experimentalAllowChooseAccount,
              )
            }
            rightIcon={<Switch isChecked={experimentalAllowChooseAccount} />}
            extendedDescription={
              <P4 color="neutrals.300" w="100%">
                Shows a new menu item in the account settings, which allows a
                user to switch account implementation for an account.
              </P4>
            }
          >
            Change account implementation
          </ButtonCell>
        </CellStack>
      </SettingsScreenWrapper>
    </NavigationContainer>
  )
}
