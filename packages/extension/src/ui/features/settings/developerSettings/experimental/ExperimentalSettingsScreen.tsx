import {
  BarBackButton,
  ButtonCell,
  CellStack,
  NavigationContainer,
  Switch,
} from "@argent/x-ui"
import { FC, ReactEventHandler } from "react"

interface ExperimentalSettingsScreenProps {
  experimentalAllowChooseAccount: boolean
  toggleExperimentalAllowChooseAccount: ReactEventHandler
}

export const ExperimentalSettingsScreen: FC<
  ExperimentalSettingsScreenProps
> = ({
  experimentalAllowChooseAccount,
  toggleExperimentalAllowChooseAccount,
}) => {
  return (
    <NavigationContainer leftButton={<BarBackButton />} title={"Experimental"}>
      <CellStack>
        <ButtonCell
          onClick={toggleExperimentalAllowChooseAccount}
          rightIcon={<Switch isChecked={experimentalAllowChooseAccount} />}
          extendedDescription={
            "Shows a new menu item in the account settings, which allows a user to switch account implementation for an account."
          }
        >
          Change account implementation
        </ButtonCell>
      </CellStack>
    </NavigationContainer>
  )
}
