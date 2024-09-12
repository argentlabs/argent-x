import { Button, iconsDeprecated } from "@argent/x-ui"
import { ComponentProps, FC } from "react"
import { Link } from "react-router-dom"

import { routes } from "../../../shared/ui/routes"

const { AddIcon } = iconsDeprecated

export const NewTokenButton: FC<ComponentProps<typeof Button>> = (props) => {
  return (
    <Button
      size={"sm"}
      colorScheme={"transparent"}
      mx={"auto"}
      as={Link}
      to={routes.newToken()}
      leftIcon={<AddIcon />}
      color="text-secondary"
      loadingText={"Fetching tokens"}
      {...props}
    >
      New token
    </Button>
  )
}
