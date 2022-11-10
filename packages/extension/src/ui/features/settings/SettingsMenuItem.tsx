import { H6, icons } from "@argent/ui"
import { Flex, Text } from "@chakra-ui/react"
import { FC, ReactNode } from "react"
import { Link } from "react-router-dom"

const { ChevronRightIcon } = icons

interface SettingsMenuItemProps {
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  onClick?: () => void
  title: string
  to: string
}

const SettingsMenuItem: FC<SettingsMenuItemProps> = ({
  leftIcon,
  rightIcon,
  onClick,
  to,
  title,
}) => (
  <Link to={to} onClick={onClick}>
    <Flex
      borderRadius="8"
      backgroundColor="neutrals.800"
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      px="6"
      py="5"
    >
      <Flex gap="4">
        {leftIcon && <Text fontSize="xl">{leftIcon}</Text>}
        <H6>{title}</H6>
      </Flex>
      {rightIcon ? <>{rightIcon}</> : <ChevronRightIcon fontSize="inherit" />}
    </Flex>
  </Link>
)

export { SettingsMenuItem }
