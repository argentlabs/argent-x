import { P4 } from "@argent/x-ui"
import { ChakraComponent, HStack } from "@chakra-ui/react"
import { FC, PropsWithChildren } from "react"

interface SmartAccountIconRowProps extends PropsWithChildren {
  icon: ChakraComponent<"svg">
}

export const SmartAccountIconRow: FC<SmartAccountIconRowProps> = ({
  icon: Icon,
  children,
}) => {
  return (
    <HStack spacing={3} width={"full"}>
      <Icon fontSize={"xl"} flexShrink={0} />
      <P4 fontWeight={"semibold"}>{children}</P4>
    </HStack>
  )
}
