import { P4 } from "@argent/ui"
import { ChakraComponent, HStack } from "@chakra-ui/react"
import { FC, PropsWithChildren } from "react"

interface ShieldIconRowProps extends PropsWithChildren {
  icon: ChakraComponent<"svg">
}

export const ShieldIconRow: FC<ShieldIconRowProps> = ({
  icon: Icon,
  children,
}) => {
  return (
    <HStack spacing={3}>
      <Icon fontSize={"xl"} flexShrink={0} />
      <P4>{children}</P4>
    </HStack>
  )
}
