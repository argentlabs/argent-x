import { Button, Center, Circle, Text } from "@chakra-ui/react"
import { ComponentProps, FC, PropsWithChildren, ReactNode } from "react"

import * as icons from "./icons"
import { H5 } from "./Typography"

const { HelpIcon } = icons

export interface EmptyProps extends PropsWithChildren {
  icon?: ReactNode
  title?: ReactNode
}

export const Empty: FC<EmptyProps> = ({
  icon = <HelpIcon />,
  title = "Nothing to show",
  children,
}) => (
  <Center flex={1} py={4} px={14}>
    <Center flexDirection={"column"} color={"neutrals.500"}>
      <Circle backgroundColor={"panel"} size={20}>
        <Text fontSize={"5xl"}>{icon}</Text>
      </Circle>
      <H5 textAlign={"center"} pt={4} pb={4}>
        {title}
      </H5>
      {children}
    </Center>
  </Center>
)

export const EmptyButton: FC<ComponentProps<typeof Button>> = (props) => (
  <Button colorScheme={"tertiary"} size={"sm"} {...props} />
)
