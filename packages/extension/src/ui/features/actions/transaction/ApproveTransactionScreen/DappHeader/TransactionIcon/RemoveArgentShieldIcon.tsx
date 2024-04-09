import { icons } from "@argent/x-ui"

import { IconWrapper } from "./IconWrapper"

const { ArgentShieldDeactivateIcon } = icons

export const RemoveArgentShieldIcon = () => {
  return (
    <IconWrapper borderRadius="full" padding={4}>
      <ArgentShieldDeactivateIcon fontSize={"4xl"} color="white" />
    </IconWrapper>
  )
}
