import { Button, icons } from "@argent/x-ui"
import { ButtonProps } from "@chakra-ui/react"
import { FC } from "react"

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
        onClick && onClick(e)
      }}
      {...rest}
    >
      Save
    </Button>
  )
}
