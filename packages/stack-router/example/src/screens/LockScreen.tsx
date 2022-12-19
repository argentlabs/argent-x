import { ButtonCell, CellStack, NavigationContainer } from "@argent/ui"
import { NavLink } from "react-router-dom"

export function LockScreen() {
  return (
    <NavigationContainer title={"Locked"}>
      <CellStack>
        <ButtonCell as={NavLink} to="/" replace>
          Unlock
        </ButtonCell>
      </CellStack>
    </NavigationContainer>
  )
}
