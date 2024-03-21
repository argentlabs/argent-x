import { logos } from "@argent/x-ui"
import { Center, CenterProps } from "@chakra-ui/react"
import { FC } from "react"

interface SettingsRadioIconProps extends CenterProps {
  logo: keyof typeof logos
}

export const SettingsMenuItemLogo: FC<SettingsRadioIconProps> = ({
  logo,
  ...rest
}) => {
  const LogoComponent = logos[logo]
  return (
    <Center rounded="xl" bg="black" w={10} h={10} {...rest}>
      <LogoComponent fontSize="3xl" bg="black" />
    </Center>
  )
}
