import { icons } from "@argent/ui"

import { IconWrapper } from "./IconWrapper"

const { MultisigIcon } = icons

export const ActivateMultisigIcon = () => {
  return (
    <IconWrapper borderRadius="full" padding={4}>
      <MultisigIcon fontSize={"4xl"} color="white" />
    </IconWrapper>
  )
}
