import { P3 } from "@argent/x-ui"
import type { ChakraComponent } from "@chakra-ui/react"
import { HStack } from "@chakra-ui/react"
import type { FC, PropsWithChildren } from "react"

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
      <P3 fontWeight={"semibold"}>{children}</P3>
    </HStack>
  )
}
