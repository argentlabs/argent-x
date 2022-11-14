import { ButtonCell, icons } from "@argent/ui"
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
  <ButtonCell
    as={Link}
    leftIcon={<>{leftIcon}</>}
    rightIcon={<>{rightIcon}</>}
    width="100%"
    to={to}
    onClick={onClick}
  >
    {title}
  </ButtonCell>
)

export { SettingsMenuItem }
