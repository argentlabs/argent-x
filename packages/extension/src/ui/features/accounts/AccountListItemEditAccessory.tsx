import { EditPrimaryIcon } from "@argent/x-ui/icons"
import type { ButtonProps } from "@chakra-ui/react"
import { Button } from "@chakra-ui/react"
import type { FC } from "react"

export const AccountListItemEditAccessory: FC<ButtonProps> = ({
  onClick,
  ...rest
}) => {
  return (
    <Button
      bg="icon-background"
      color="icon-default"
      colorScheme="transparent"
      padding="1.5"
      fontSize="2xs"
      size="auto"
      rounded="full"
      visibility={"hidden"}
      _groupHover={{
        visibility: "visible",
      }}
      onClick={(e) => {
        e.stopPropagation() /** prevent click on containing button */
        onClick?.(e)
      }}
      {...rest}
    >
      <EditPrimaryIcon />
    </Button>
  )
}
