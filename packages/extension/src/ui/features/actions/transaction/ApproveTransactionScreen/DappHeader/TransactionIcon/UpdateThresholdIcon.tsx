import { icons } from "@argent/ui"

import { IconWrapper } from "./IconWrapper"

const { ApproveIcon } = icons

export const UpdateThresholdIcon = () => {
  return (
    <IconWrapper borderRadius="full" padding={4}>
      <ApproveIcon fontSize={"4xl"} color="white" />
    </IconWrapper>
  )
}
