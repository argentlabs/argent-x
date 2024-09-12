import { iconsDeprecated } from "@argent/x-ui"

import { IconWrapper } from "./IconWrapper"

const { DocumentIcon } = iconsDeprecated

export const DeclareContractIcon = () => {
  return (
    <IconWrapper
      data-testid="declare-contract-icon"
      position="relative"
      borderRadius="90"
    >
      <DocumentIcon fontSize="2xl" />
    </IconWrapper>
  )
}
