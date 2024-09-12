import {
  BarBackButton,
  ButtonCell,
  CellStack,
  NavigationContainer,
} from "@argent/x-ui"
import { Link, useNavigate } from "react-router-dom"

const ids = Array.from({ length: 10 }).map((_, index) => index + 1)

export function Activities() {
  const navigate = useNavigate()

  return (
    <NavigationContainer
      title={`Activities`}
      leftButton={<BarBackButton onClick={() => navigate("/")} />}
    >
      <CellStack>
        {ids.map((id) => (
          <ButtonCell key={id} as={Link} to={`/activity/${id}`}>
            Activity {id}
          </ButtonCell>
        ))}
      </CellStack>
    </NavigationContainer>
  )
}
