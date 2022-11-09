import { Button, CopyTooltip } from "@argent/ui"
import { FC } from "react"

import { formatTruncatedAddress, normalizeAddress } from "../services/addresses"

export interface AddressCopyButtonProps {
  address: string
}

export const AddressCopyButton: FC<AddressCopyButtonProps> = ({ address }) => {
  const copyValue = normalizeAddress(address)
  return (
    <CopyTooltip prompt="Click to copy address" copyValue={copyValue}>
      <Button
        size="3xs"
        color={"white50"}
        bg={"transparent"}
        _hover={{ bg: "neutrals.700", color: "text" }}
      >
        {formatTruncatedAddress(address)}
      </Button>
    </CopyTooltip>
  )
}
