import { PlusSecondaryIcon } from "@argent/x-ui/icons"
import { Button } from "@argent/x-ui"
import type { ComponentProps, FC } from "react"
import { Link } from "react-router-dom"

import { routes } from "../../../shared/ui/routes"

export const NewTokenButton: FC<ComponentProps<typeof Button>> = (props) => {
  return (
    <Button
      size={"sm"}
      colorScheme={"transparent"}
      mx={"auto"}
      as={Link}
      to={routes.newToken()}
      leftIcon={<PlusSecondaryIcon />}
      color="text-secondary"
      loadingText={"Fetching tokens"}
      {...props}
    >
      New token
    </Button>
  )
}
