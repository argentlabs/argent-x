import {
  BarCloseButton,
  ButtonCell,
  CellStack,
  NavigationContainer,
} from "@argent/ui"
import { Link } from "react-router-dom"

const ids = Array.from({ length: 10 }).map((_, index) => index + 1)

export function Accounts() {
  return (
    <NavigationContainer title={`Accounts`} rightButton={<BarCloseButton />}>
      <CellStack>
        {ids.map((id) => (
          <ButtonCell key={id} as={Link} to={`/accounts/${id}`}>
            Account {id}
          </ButtonCell>
        ))}
      </CellStack>
    </NavigationContainer>
  )
}
