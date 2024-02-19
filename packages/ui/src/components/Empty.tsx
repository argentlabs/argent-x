import { Button, Center, CenterProps, Circle, Text } from "@chakra-ui/react"
import { ComponentProps, FC, ReactNode } from "react"

import * as icons from "./icons"
import { H5, P4 } from "./Typography"

const { HelpIcon } = icons

export interface EmptyProps extends Omit<CenterProps, "title"> {
  icon?: ReactNode
  title?: ReactNode
  subtitle?: ReactNode
}

export const Empty: FC<EmptyProps> = ({
  icon = <HelpIcon />,
  title = "Nothing to show",
  subtitle,
  children,
  ...rest
}) => (
  <Center flex={1} py={4} px={14} {...rest}>
    <Center
      flexDirection={"column"}
      color={"neutrals.400"}
      textAlign={"center"}
    >
      <Circle backgroundColor={"panel"} size={19}>
        <Text fontSize={"5xl"}>{icon}</Text>
      </Circle>
      <Center py={4} gap={1} flexDirection={"column"}>
        {title && <H5>{title}</H5>}
        {subtitle && <P4 fontWeight={"bold"}>{subtitle}</P4>}
      </Center>
      {children}
    </Center>
  </Center>
)

export const EmptyButton: FC<ComponentProps<typeof Button>> = (props) => (
  <Button colorScheme={"tertiary"} size={"sm"} {...props} />
)
