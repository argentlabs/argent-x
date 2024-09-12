import { iconsDeprecated } from "@argent/x-ui"

import { IconWrapper } from "./IconWrapper"

const { SmartAccountInactiveIcon } = iconsDeprecated

export const DowngradeSmartAccouIcon = () => {
  return (
    <IconWrapper borderRadius="full" padding={4}>
      <SmartAccountInactiveIcon fontSize={"4xl"} color="white" />
    </IconWrapper>
  )
}
