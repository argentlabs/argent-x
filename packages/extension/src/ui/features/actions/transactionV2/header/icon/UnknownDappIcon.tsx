import { icons } from "@argent/x-ui"
import type { BoxProps } from "@chakra-ui/react"
import type { FC } from "react"

import { IconWrapper } from "./IconWrapper"

const { NetworkSecondaryIcon } = icons

export const UnknownDappIcon: FC<BoxProps> = (props) => {
  return (
    <IconWrapper bg="surface-elevated" {...props}>
      <NetworkSecondaryIcon fontSize="4xl" color="neutrals.500" />
    </IconWrapper>
  )
}
