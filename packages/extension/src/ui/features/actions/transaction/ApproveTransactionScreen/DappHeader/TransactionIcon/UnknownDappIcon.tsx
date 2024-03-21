import { icons } from "@argent/x-ui"

import { IconWrapper } from "./IconWrapper"

const { NetworkIcon } = icons

export const UnknownDappIcon = () => {
  return (
    <IconWrapper>
      <NetworkIcon fontSize={"4xl"} color="neutrals.500" />
    </IconWrapper>
  )
}
