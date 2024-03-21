import { formatTruncatedAddress } from "@argent/x-shared"
import { Text, Tooltip, TooltipProps } from "@chakra-ui/react"
import { FC, useCallback } from "react"

import { openBlockExplorerAddress } from "../../../../../../services/blockExplorer.service"
import { useCurrentNetwork } from "../../../../../networks/hooks/useCurrentNetwork"

interface AddressTooltipProps extends TooltipProps {
  address: string
}

export const AddressTooltip: FC<AddressTooltipProps> = ({
  address,
  children,
  ...rest
}) => {
  const network = useCurrentNetwork()
  const onOpen = useCallback(
    () => void openBlockExplorerAddress(network, address),
    [address, network],
  )
  const tooltip = formatTruncatedAddress(address)

  return (
    <Tooltip label={tooltip} placement="top" {...rest}>
      <Text
        onClick={onOpen}
        cursor={"pointer"}
        _hover={{
          textDecoration: "underline",
          color: "text-secondary",
        }}
      >
        {children}
      </Text>
    </Tooltip>
  )
}
