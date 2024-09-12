import { Button } from "@argent/x-ui"
import { Center, chakra } from "@chakra-ui/react"
import { FC, ReactEventHandler } from "react"

const Container = chakra(Center, {
  baseStyle: {
    height: 16,
    borderTop: "1px solid",
    borderTopColor: "border",
    background: "surface-default",
    boxShadow: "menu",
  },
})

export interface AccountListFooterProps {
  onClick: ReactEventHandler
  icon: React.JSX.Element
  text: string
}

export const AccountListFooter: FC<AccountListFooterProps> = ({
  onClick,
  icon,
  text,
}) => {
  return (
    <Container>
      <Button
        onClick={onClick}
        leftIcon={icon}
        size="sm"
        colorScheme="transparent"
        color="text-secondary"
      >
        {text}
      </Button>
    </Container>
  )
}
