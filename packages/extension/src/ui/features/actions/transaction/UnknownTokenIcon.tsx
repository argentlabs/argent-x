import { icons } from "@argent/ui"
import { BoxProps, Center } from "@chakra-ui/react"
import { FC } from "react"

const { QuestionMarkIcon } = icons

export const UnknownTokenIcon: FC<BoxProps> = ({ ...props }) => {
  return (
    <Center bg="neutrals.500" borderRadius="full" {...props}>
      <QuestionMarkIcon color="neutrals.200" />
    </Center>
  )
}
