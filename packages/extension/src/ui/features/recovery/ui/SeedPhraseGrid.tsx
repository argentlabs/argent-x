import { Flex } from "@chakra-ui/react"
import { FC, PropsWithChildren } from "react"

export const SeedPhraseGrid: FC<PropsWithChildren> = ({
  children,
  ...props
}) => {
  return (
    <Flex
      display="grid"
      gridTemplateColumns="repeat(3, 1fr)"
      gridTemplateRows="repeat(4, 1fr)"
      gridGap="12px"
      marginBottom="35px"
      {...props}
    >
      {children}
    </Flex>
  )
}
