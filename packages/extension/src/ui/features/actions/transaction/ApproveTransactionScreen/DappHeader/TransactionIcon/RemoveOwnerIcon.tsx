import { icons } from "@argent/ui"

import { IconWrapper } from "./IconWrapper"

const { MultisigRemoveIcon } = icons

export const RemoveOwnerIcon = () => {
  return (
    <IconWrapper borderRadius="full" padding={4}>
      <MultisigRemoveIcon fontSize={"4xl"} color="white" />
    </IconWrapper>
  )
}
