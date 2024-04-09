/**
 * Why is this a container?
 */
import { Button, icons } from "@argent/x-ui"
import { Center, chakra } from "@chakra-ui/react"
import { FC, ReactEventHandler } from "react"

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

interface HiddenAccountsBarProps {
  onClick: ReactEventHandler
}

export const HiddenAccountsBar: FC<HiddenAccountsBarProps> = ({ onClick }) => {
  return (
    <Container>
      <Button
        onClick={onClick}
        leftIcon={<HideIcon />}
        size="sm"
        colorScheme="transparent"
        color="white.50"
      >
        Hidden accounts
      </Button>
    </Container>
  )
}
