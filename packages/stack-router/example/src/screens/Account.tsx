import {
  BarBackButton,
  BarIconButton,
  ButtonCell,
  CellStack,
  HeaderCell,
  icons,
  NavigationContainer,
  SpacerCell,
} from "@argent/x-ui"
import { Link, useNavigate, useParams } from "react-router-dom"

const { MoreSecondaryIcon } = icons

export function Account() {
  const { id } = useParams()
  const navigate = useNavigate()
  return (
    <NavigationContainer
      title={`Account ${id}`}
      leftButton={<BarBackButton onClick={() => navigate("/")} />}
      rightButton={
        <BarIconButton as={Link} to={"/accounts"}>
          <MoreSecondaryIcon />
        </BarIconButton>
      }
    >
      <CellStack>
        <HeaderCell>Account {id}</HeaderCell>
        <SpacerCell />
        <ButtonCell as={Link} to={"/accounts"}>
          Change account
        </ButtonCell>
      </CellStack>
    </NavigationContainer>
  )
}
