import { ButtonCell, ButtonCellProps, icons } from "@argent/ui"
import { FC } from "react"
import { Link } from "react-router-dom"

const { ChevronRightIcon } = icons

interface SettingsMenuItemProps extends ButtonCellProps {
  title: string
  to: string
}

const SettingsMenuItem: FC<SettingsMenuItemProps> = ({
  rightIcon = <ChevronRightIcon />,
  to,
  title,
  ...rest
}) => (
  <ButtonCell as={Link} rightIcon={rightIcon} width="100%" to={to} {...rest}>
    {title}
  </ButtonCell>
)

export { SettingsMenuItem }
