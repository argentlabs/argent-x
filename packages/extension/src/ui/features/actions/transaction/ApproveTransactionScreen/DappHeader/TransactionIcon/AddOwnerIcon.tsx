import { iconsDeprecated } from "@argent/x-ui"

import { IconWrapper } from "./IconWrapper"

const { MultisigJoinIcon } = iconsDeprecated

export const AddOwnerIcon = () => {
  return (
    <IconWrapper borderRadius="full" padding={4}>
      <MultisigJoinIcon fontSize={"4xl"} color="white" />
    </IconWrapper>
  )
}
