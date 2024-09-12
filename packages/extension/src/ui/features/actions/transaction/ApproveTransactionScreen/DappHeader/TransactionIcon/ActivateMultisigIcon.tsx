import { iconsDeprecated } from "@argent/x-ui"

import { IconWrapper } from "./IconWrapper"

const { MultisigIcon } = iconsDeprecated

export const ActivateMultisigIcon = () => {
  return (
    <IconWrapper borderRadius="full" padding={4}>
      <MultisigIcon fontSize={"4xl"} color="white" />
    </IconWrapper>
  )
}
