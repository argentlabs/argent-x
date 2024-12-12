import { type LogoDeprecatedKeys, logosDeprecated } from "@argent/x-ui"
import type { CenterProps } from "@chakra-ui/react"
import { Center } from "@chakra-ui/react"
import type { FC } from "react"

interface SettingsRadioIconProps extends CenterProps {
  logo: LogoDeprecatedKeys
}

export const SettingsMenuItemLogo: FC<SettingsRadioIconProps> = ({
  logo,
  ...rest
}) => {
  const LogoComponent = logosDeprecated[logo]
  return (
    <Center rounded="xl" bg="black" w={10} h={10} {...rest}>
      <LogoComponent fontSize="3xl" bg="black" />
    </Center>
  )
}
