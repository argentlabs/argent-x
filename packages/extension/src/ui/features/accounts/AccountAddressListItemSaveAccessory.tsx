import { Button, icons } from "@argent/x-ui"
import type { ButtonProps } from "@chakra-ui/react"
import type { FC } from "react"

const { AddressBookIcon } = icons

export const AccountAddressListItemSaveAccessory: FC<ButtonProps> = ({
  onClick,
  ...rest
}) => {
  return (
    <Button
      as="div"
      ml={3}
      size={"xs"}
      rounded={"lg"}
      pointerEvents="auto"
      bg={"neutrals.500"}
      _hover={{ bg: "neutrals.600" }}
      leftIcon={<AddressBookIcon />}
      onClick={(e) => {
        e.stopPropagation() /** prevent click on containing button */
        if (onClick) {
          onClick(e)
        }
      }}
      {...rest}
    >
      Save
    </Button>
  )
}
