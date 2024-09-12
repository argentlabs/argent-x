import { iconsDeprecated } from "@argent/x-ui"

import { IconWrapper } from "./IconWrapper"

const { DeployIcon } = iconsDeprecated

export const ActivateAccountIcon = () => {
  return (
    <IconWrapper borderRadius="full" padding={4}>
      <DeployIcon fontSize={"4xl"} color="white" />
    </IconWrapper>
  )
}
