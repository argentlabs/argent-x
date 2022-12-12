import { Button, icons } from "@argent/ui"
import { Center, chakra } from "@chakra-ui/react"
import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { useAppState } from "../../app.state"
import { routes } from "../../routes"

const { HideIcon } = icons

const Container = chakra(Center, {
  baseStyle: {
    height: 16,
    borderTop: "1px solid",
    borderTopColor: "border",
    background: "bg",
    boxShadow: "menu",
  },
})

export const HiddenAccountsBar: FC = () => {
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()

  return (
    <Container>
      <Button
        onClick={() => navigate(routes.accountsHidden(switcherNetworkId))}
        leftIcon={<HideIcon />}
        size="sm"
        colorScheme="transparent"
        color="white50"
      >
        Hidden accounts
      </Button>
    </Container>
  )
}
