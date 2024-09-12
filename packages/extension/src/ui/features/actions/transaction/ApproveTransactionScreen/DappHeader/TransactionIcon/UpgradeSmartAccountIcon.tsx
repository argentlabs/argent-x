import { iconsDeprecated } from "@argent/x-ui"

import { IconWrapper } from "./IconWrapper"

const { SmartAccountActiveIcon } = iconsDeprecated

export const UpgradeSmartAccountdIcon = () => {
  return (
    <IconWrapper borderRadius="full" padding={4}>
      <SmartAccountActiveIcon fontSize={"4xl"} color="white" />
    </IconWrapper>
  )
}
