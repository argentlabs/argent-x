import { icons } from "@argent/ui"

import { IconWrapper } from "./IconWrapper"

const { MultisigReplaceIcon } = icons

export const ReplaceOwnerIcon = () => {
  return (
    <IconWrapper borderRadius="full" padding={4}>
      <MultisigReplaceIcon fontSize={"4xl"} color="white" />
    </IconWrapper>
  )
}
