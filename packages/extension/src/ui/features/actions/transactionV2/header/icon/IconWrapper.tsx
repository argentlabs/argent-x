import type { BoxProps } from "@chakra-ui/react"
import { Center } from "@chakra-ui/react"
import type { FC } from "react"

export const IconWrapper: FC<BoxProps> = (props) => {
  return (
    <Center w="14" h="14" background="primary.500" rounded="2xl" {...props} />
  )
}
