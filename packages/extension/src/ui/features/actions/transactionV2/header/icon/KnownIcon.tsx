import type { BoxProps } from "@chakra-ui/react"
import { IconWrapper } from "./IconWrapper"
import type { IconKeys } from "@argent/x-ui"
import { icons } from "@argent/x-ui"

export const KnownIcon = ({
  iconKey,
  ...rest
}: BoxProps & { iconKey: IconKeys }) => {
  const IconComponent = icons[iconKey]
  return (
    <IconWrapper rounded="2xl" {...rest}>
      <IconComponent fontSize={"xl"} color="neutrals.900" />
    </IconWrapper>
  )
}
