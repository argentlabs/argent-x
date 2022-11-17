import { Button, icons } from "@argent/ui"
import { ComponentProps, FC } from "react"
import { Link } from "react-router-dom"

import { routes } from "../../routes"

const { AddIcon } = icons

export const NewTokenButton: FC<ComponentProps<typeof Button>> = (props) => {
  return (
    <Button
      size={"sm"}
      colorScheme={"transparent"}
      mx={"auto"}
      as={Link}
      to={routes.newToken()}
      leftIcon={<AddIcon />}
      color="neutrals.400"
      loadingText={"Fetching tokens"}
      {...props}
    >
      New token
    </Button>
  )
}
