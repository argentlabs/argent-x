import { BoxProps, Center } from "@chakra-ui/react"
import { FC } from "react"

import { QuestionMarkIcon } from "../../icons"

export const UnknownTokenIcon: FC<BoxProps> = ({ ...props }) => {
  return (
    <Center bg="neutrals.500" borderRadius="full" {...props}>
      <QuestionMarkIcon color="neutrals.200" />
    </Center>
  )
}
