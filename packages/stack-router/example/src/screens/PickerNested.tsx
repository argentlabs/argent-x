import {
  BarBackButton,
  BarCloseButton,
  ButtonCell,
  CellStack,
  NavigationContainer,
} from "@argent/x-ui"
import { Link, useNavigate } from "react-router-dom"

export function PickerNested() {
  const navigate = useNavigate()
  return (
    <NavigationContainer
      title={"Picker Nested"}
      leftButton={<BarBackButton />}
      rightButton={<BarCloseButton onClick={() => navigate("/")} />}
    >
      <CellStack>
        <ButtonCell as={Link} to="/picker/nested/picker">
          Picker Nested Picker
        </ButtonCell>
        <ButtonCell as={Link} to="/">
          Push Home
        </ButtonCell>
      </CellStack>
    </NavigationContainer>
  )
}
