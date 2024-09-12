import { iconsDeprecated } from "@argent/x-ui"

import { IconWrapper } from "./IconWrapper"

const { MultisigReplaceIcon } = iconsDeprecated

export const ReplaceOwnerIcon = () => {
  return (
    <IconWrapper borderRadius="full" padding={4}>
      <MultisigReplaceIcon fontSize={"4xl"} color="white" />
    </IconWrapper>
  )
}
