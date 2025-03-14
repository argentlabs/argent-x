import type { SquareProps } from "@chakra-ui/react"
import { Square, Image } from "@chakra-ui/react"
import { ValidatorSecondaryIcon } from "@argent/x-ui/icons"
import type { FC } from "react"

interface StakerIconProps extends SquareProps {
  iconUrl?: string
}

export const StakerIcon: FC<StakerIconProps> = ({
  iconUrl,
  size = 5,
  ...rest
}) => {
  return (
    <Square
      rounded="md"
      bg="surface-elevated-hover"
      color="text-secondary"
      position="relative"
      overflow="hidden"
      size={size}
      {...rest}
    >
      <Image
        fit="cover"
        src={iconUrl}
        fallback={<ValidatorSecondaryIcon fontSize={"small"} />}
      />
    </Square>
  )
}
