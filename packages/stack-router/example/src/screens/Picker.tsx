import {
  BarCloseButton,
  ButtonCell,
  CellStack,
  NavigationContainer,
  SpacerCell,
} from "@argent/ui"
import { Link } from "react-router-dom"

export function Picker() {
  return (
    <NavigationContainer title={"Picker"} rightButton={<BarCloseButton />}>
      <CellStack>
        <ButtonCell as={Link} to={"/picker/nested"}>
          Picker nested
        </ButtonCell>
        <SpacerCell />
        <ButtonCell as={Link} to="/">
          Push home
        </ButtonCell>
      </CellStack>
    </NavigationContainer>
  )
}
