import { Button } from "@argent/x-ui"
import type { ButtonProps } from "@chakra-ui/react"
import { Center, chakra } from "@chakra-ui/react"
import type { FC, ReactEventHandler } from "react"

const Container = chakra(Center, {
  baseStyle: {
    height: 16,
    borderTop: "1px solid",
    borderTopColor: "border",
    background: "surface-default",
    boxShadow: "menu",
  },
})

export interface AccountListFooterProps extends ButtonProps {
  onClick: ReactEventHandler
  icon: React.JSX.Element
  text: string
}

export const AccountListFooter: FC<AccountListFooterProps> = ({
  icon,
  text,
  ...rest
}) => {
  return (
    <Container>
      <Button
        leftIcon={icon}
        size="sm"
        colorScheme="transparent"
        color="text-secondary"
        {...rest}
      >
        {text}
      </Button>
    </Container>
  )
}
