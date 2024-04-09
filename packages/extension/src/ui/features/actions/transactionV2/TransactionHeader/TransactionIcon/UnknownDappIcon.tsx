import { icons } from "@argent/x-ui"
import { BoxProps } from "@chakra-ui/react"
import { FC } from "react"

import { IconWrapper } from "./IconWrapper"

const { NetworkIcon } = icons

export const UnknownDappIcon: FC<BoxProps> = (props) => {
  return (
    <IconWrapper borderRadius={2} padding={4} bg={"neutrals.800"} {...props}>
      <NetworkIcon fontSize={"4xl"} color="neutrals.500" />
    </IconWrapper>
  )
}
