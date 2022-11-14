import { ButtonCell, H6, icons } from "@argent/ui"
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
  rightIcon = <ChevronRightIcon fontSize="inherit" />,
  onClick,
  to,
  title,
}) => (
  <Link to={to} onClick={onClick}>
    <ButtonCell
      leftIcon={<>{leftIcon}</>}
      rightIcon={<>{rightIcon}</>}
      width="100%"
    >
      {title}
    </ButtonCell>
  </Link>
)

export { SettingsMenuItem }
