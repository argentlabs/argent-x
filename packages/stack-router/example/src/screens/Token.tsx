import {
  BarBackButton,
  CellStack,
  HeaderCell,
  NavigationContainer,
} from "@argent/x-ui"
import { useNavigate, useParams } from "react-router-dom"

export function Token() {
  const { id } = useParams()
  const navigate = useNavigate()
  return (
    <NavigationContainer
      title={`Token ${id}`}
      leftButton={<BarBackButton onClick={() => navigate("/")} />}
    >
      <CellStack>
        <HeaderCell>Token {id}</HeaderCell>
      </CellStack>
    </NavigationContainer>
  )
}
