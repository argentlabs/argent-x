import { Token } from "@argent/x-shared"
import { iconsDeprecated } from "@argent/x-ui"

import { Flex, Img } from "@chakra-ui/react"
import { FC } from "react"

const { DropdownDownIcon } = iconsDeprecated

interface TokenPickerProps {
  selected: Token
  onClick: () => void
}

export const TokenPicker: FC<TokenPickerProps> = ({ onClick, selected }) => {
  const { image, name } = selected
  return (
    <Flex
      alignItems="center"
      cursor="pointer"
      rounded={"full"}
      backgroundColor={"neutrals.700"}
      width="fit-content"
      color={"white"}
      userSelect={"none"}
    >
      <DropdownDownIcon height="10px" width="10px" ml="6px" mr="4px" />
      <Img
        src={image}
        alt={name}
        onClick={onClick}
        height="18px"
        width="18px"
      />
    </Flex>
  )
}
