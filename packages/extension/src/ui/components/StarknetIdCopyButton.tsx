import { normalizeAddress, formatTruncatedAddress } from "@argent/x-shared"
import { Button, CopyTooltip } from "@argent/x-ui"
import { ButtonProps } from "@chakra-ui/react"
import { FC } from "react"

export interface StarknetIdCopyButtonProps extends ButtonProps {
  starknetId: string
  address: string
}

export const StarknetIdCopyButton: FC<StarknetIdCopyButtonProps> = ({
  starknetId,
  address,
}) => {
  const copyValue = normalizeAddress(address)
  return (
    <CopyTooltip
      prompt={formatTruncatedAddress(copyValue)}
      copyValue={copyValue}
    >
      <Button
        size="3xs"
        bg="neutrals.700"
        _hover={{ bg: "neutrals.700", color: "text-primary" }}
        borderRadius="100px"
        color="white.50"
        textAlign="center"
        pb={1}
        pt={0.5}
      >
        {starknetId}
      </Button>
    </CopyTooltip>
  )
}
