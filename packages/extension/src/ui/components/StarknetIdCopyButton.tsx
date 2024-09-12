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
  ...rest
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
        {...rest}
      >
        {starknetId}
      </Button>
    </CopyTooltip>
  )
}
