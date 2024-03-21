import { icons } from "@argent/x-ui"

import { IconWrapper } from "./IconWrapper"

const { DeployIcon } = icons

export const ActivateAccountIcon = () => {
  return (
    <IconWrapper borderRadius="full" padding={4}>
      <DeployIcon fontSize={"4xl"} color="white" />
    </IconWrapper>
  )
}
