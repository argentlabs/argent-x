import { Button, icons } from "@argent/ui"
import { Center, chakra } from "@chakra-ui/react"
import { FC } from "react"
import { useLocation, useNavigate } from "react-router-dom"

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
  const location = useLocation()
  return (
    <Container>
      <Button
        onClick={() => navigate(routes.accountsHidden(location.pathname))}
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
