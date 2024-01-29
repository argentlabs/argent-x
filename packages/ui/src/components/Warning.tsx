import { Center, CenterProps, Circle, Text } from "@chakra-ui/react"
import { FC, ReactNode } from "react"

import { H3, P3 } from "./Typography"
import * as icons from "./icons"

const { AlertIcon } = icons

interface WarningProps extends Omit<CenterProps, "title"> {
  icon?: ReactNode
  title?: ReactNode
  subtitle?: ReactNode
}

export const Warning: FC<WarningProps> = ({
  icon = <AlertIcon />,
  title = "Warning",
  subtitle,
  children,
  ...rest
}) => (
  <Center flex={1} py={4} px={6} {...rest}>
    <Center flexDirection={"column"} gap={3} textAlign="center">
      <Circle size={24} bg="primaryExtraDark.500" color="primary.500" mb={5}>
        <Text fontSize={40}>{icon}</Text>
      </Circle>
      {title && <H3>{title}</H3>}
      {subtitle && <P3 color="text.secondary">{subtitle}</P3>}
      {children}
    </Center>
  </Center>
)
