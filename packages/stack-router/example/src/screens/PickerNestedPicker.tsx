import {
  BarCloseButton,
  ButtonCell,
  CellStack,
  NavigationContainer,
} from "@argent/x-ui"
import { Link, useNavigate } from "react-router-dom"

export function PickerNestedPicker() {
  const navigate = useNavigate()
  return (
    <NavigationContainer
      title={"Picker Nested Picker"}
      rightButton={
        <BarCloseButton onClick={() => navigate("/picker/nested")} />
      }
    >
      <CellStack>
        <ButtonCell as={Link} to="/">
          Push Home
        </ButtonCell>
      </CellStack>
    </NavigationContainer>
  )
}
