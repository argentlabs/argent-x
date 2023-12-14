import { BoxProps, Center } from "@chakra-ui/react"
import { FC } from "react"

export const IconWrapper: FC<BoxProps> = (props) => {
  return (
    <Center
      w="14"
      h="14"
      background="primary.500"
      borderRadius="full"
      {...props}
    />
  )
}
