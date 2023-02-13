import { icons } from "@argent/ui"

import { IconWrapper } from "./IconWrapper"

const { DocumentIcon } = icons
export const DeclareContractIcon = () => {
  return (
    <IconWrapper
      data-testid="declare-contract-icon"
      position="relative"
      borderRadius="90"
    >
      <DocumentIcon />
    </IconWrapper>
  )
}
