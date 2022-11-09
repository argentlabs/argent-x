import { H6, icons } from "@argent/ui"
import { Box } from "@chakra-ui/react"
import { FC } from "react"
import { Link } from "react-router-dom"

const { ChevronRightIcon } = icons

interface SettingsMenuItemProps {
  onClick?: () => void
  title: string
  to: string
}

const SettingsMenuItem: FC<SettingsMenuItemProps> = ({
  onClick,
  to,
  title,
}) => (
  <Link to={to} onClick={onClick}>
    <Box
      borderRadius="8"
      backgroundColor="neutrals.800"
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      py="6"
      px="8"
    >
      <H6>{title}</H6>
      <ChevronRightIcon fontSize="inherit" />
    </Box>
  </Link>
)

export { SettingsMenuItem }
