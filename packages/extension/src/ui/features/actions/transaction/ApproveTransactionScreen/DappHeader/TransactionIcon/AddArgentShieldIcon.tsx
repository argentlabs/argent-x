import { icons } from "@argent/x-ui"

import { IconWrapper } from "./IconWrapper"

const { ArgentShieldIcon } = icons

export const AddArgentShieldIcon = () => {
  return (
    <IconWrapper borderRadius="full" padding={4}>
      <ArgentShieldIcon fontSize={"4xl"} color="white" />
    </IconWrapper>
  )
}
