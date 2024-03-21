import { BoxProps } from "@chakra-ui/react"
import { IconWrapper } from "./IconWrapper"
import { icons } from "@argent/x-ui"

export const KnownIcon = ({
  iconKey,
  ...rest
}: BoxProps & { iconKey: keyof typeof icons }) => {
  const IconComponent = icons[iconKey]

  return (
    <IconWrapper borderRadius="full" {...rest}>
      <IconComponent fontSize={"xl"} color="neutrals.900" />
    </IconWrapper>
  )
}
