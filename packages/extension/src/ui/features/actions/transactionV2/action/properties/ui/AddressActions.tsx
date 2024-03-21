import { CopyTooltip, icons } from "@argent/x-ui"
import { Button, Flex, FlexProps, Tooltip } from "@chakra-ui/react"
import { FC, useCallback } from "react"

import {
  openBlockExplorerAddress,
  useBlockExplorerTitle,
} from "../../../../../../services/blockExplorer.service"
import { useCurrentNetwork } from "../../../../../networks/hooks/useCurrentNetwork"

const { CopyIcon, ExpandIcon } = icons

interface AddressActionsProps extends FlexProps {
  address: string
}

export const AddressActions: FC<AddressActionsProps> = ({
  address,
  ...rest
}) => {
  const network = useCurrentNetwork()
  const blockExplorerTitle = useBlockExplorerTitle()
  const onOpen = useCallback(
    () => void openBlockExplorerAddress(network, address),
    [address, network],
  )

  return (
    <Flex
      gap="1"
      alignItems={"center"}
      opacity={0}
      transitionProperty={"common"}
      transitionDuration={"fast"}
      _groupHover={{ opacity: 1 }}
      onClick={(e) => {
        e.stopPropagation() /** prevent click on containing button */
      }}
      {...rest}
    >
      <CopyTooltip copyValue={address} placement="top">
        <Button
          size="auto"
          color="neutrals.300"
          p={0.5}
          rounded="sm"
          _hover={{
            color: "white",
            bg: "neutrals.600",
          }}
        >
          <CopyIcon />
        </Button>
      </CopyTooltip>
      <Tooltip label={`View on ${blockExplorerTitle}`} placement="top">
        <Button
          onClick={onOpen}
          size="auto"
          color="neutrals.300"
          p={0.5}
          rounded="sm"
          _hover={{
            color: "white",
            bg: "neutrals.600",
          }}
        >
          <ExpandIcon />
        </Button>
      </Tooltip>
    </Flex>
  )
}
