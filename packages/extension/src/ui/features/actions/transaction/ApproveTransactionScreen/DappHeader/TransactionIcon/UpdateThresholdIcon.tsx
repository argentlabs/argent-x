import { iconsDeprecated } from "@argent/x-ui"

import { IconWrapper } from "./IconWrapper"

const { ApproveIcon } = iconsDeprecated

export const UpdateThresholdIcon = () => {
  return (
    <IconWrapper borderRadius="full" padding={4}>
      <ApproveIcon fontSize={"4xl"} color="white" />
    </IconWrapper>
  )
}
