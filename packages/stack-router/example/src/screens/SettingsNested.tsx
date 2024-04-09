import {
  BarBackButton,
  BarCloseButton,
  ButtonCell,
  CellStack,
  NavigationContainer,
} from "@argent/x-ui"
import { Link, useNavigate } from "react-router-dom"

export function SettingsNested() {
  const navigate = useNavigate()
  return (
    <NavigationContainer
      title={"Settings Nested"}
      leftButton={<BarBackButton />}
      rightButton={<BarCloseButton onClick={() => navigate("/")} />}
    >
      <CellStack>
        <ButtonCell as={Link} to="/">
          Push Home
        </ButtonCell>
      </CellStack>
    </NavigationContainer>
  )
}
