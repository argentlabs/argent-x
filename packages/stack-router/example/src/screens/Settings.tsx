import {
  BarCloseButton,
  ButtonCell,
  CellStack,
  NavigationContainer,
  SpacerCell,
} from "@argent/ui"
import { Link } from "react-router-dom"

export function Settings() {
  return (
    <NavigationContainer title={"Settings"} rightButton={<BarCloseButton />}>
      <CellStack>
        <ButtonCell as={Link} to={"/settings/nested"}>
          Settings nested
        </ButtonCell>
        <SpacerCell />
        <ButtonCell as={Link} to="/">
          Push home
        </ButtonCell>
      </CellStack>
    </NavigationContainer>
  )
}
