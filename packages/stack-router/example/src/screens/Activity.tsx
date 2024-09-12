import {
  BarBackButton,
  CellStack,
  HeaderCell,
  NavigationContainer,
} from "@argent/x-ui"
import { useNavigate, useParams } from "react-router-dom"

export function Activity() {
  const { id } = useParams()
  const navigate = useNavigate()
  return (
    <NavigationContainer
      title={`Activity ${id}`}
      leftButton={<BarBackButton onClick={() => navigate("/activity")} />}
    >
      <CellStack>
        <HeaderCell>Activity {id}</HeaderCell>
      </CellStack>
    </NavigationContainer>
  )
}
