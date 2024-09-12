import { iconsDeprecated } from "@argent/x-ui"

import { IconWrapper } from "./IconWrapper"

const { MultisigRemoveIcon } = iconsDeprecated

export const RemoveOwnerIcon = () => {
  return (
    <IconWrapper borderRadius="full" padding={4}>
      <MultisigRemoveIcon fontSize={"4xl"} color="white" />
    </IconWrapper>
  )
}
