import {
  CopyTooltip,
  getTokenIconUrl,
  L1,
  TokenButton,
  useBlockExplorerTitle,
  useToast,
} from "@argent/x-ui"
import type { FC } from "react"

import { formatTruncatedAddress } from "@argent/x-shared"
import {
  CopyPrimaryIcon,
  MoreSecondaryIcon,
  NetworkPrimaryIcon,
  UnruggableIcon,
  VerifiedPrimaryIcon,
} from "@argent/x-ui/icons"
import {
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tooltip,
} from "@chakra-ui/react"
import type { Token } from "../../../../shared/token/__new/types/token.model"
import { openBlockExplorerAddress } from "../../../services/blockExplorer.service"
import { useCurrentNetwork } from "../../networks/hooks/useCurrentNetwork"

interface OptionMenuProps {
  address: string
}

export const OptionsMenu = ({ address }: OptionMenuProps) => {
  const blockExplorerTitle = useBlockExplorerTitle()
  const currentNetwork = useCurrentNetwork()
  const toast = useToast()

  return (
    <Menu>
      <MenuButton
        as={Button}
        size="medium"
        px={2}
        color="icon-secondary"
        _focusVisible={{ boxShadow: "none" }} // the box-shadow on focus visible that is set in the button theme looks weird on this button
      >
        <MoreSecondaryIcon color="icon-secondary" />
      </MenuButton>
      <MenuList>
        <MenuItem
          onClick={() => {
            toast({
              title: "Copied to clipboard",
              status: "success",
            })
          }}
        >
          <CopyTooltip copyValue={address} prompt="" message="">
            <Flex alignItems="center" gap={2}>
              <CopyPrimaryIcon />
              <Flex flexDirection="column">
                Copy token address
                <L1 color="text-subtle">{formatTruncatedAddress(address)}</L1>
              </Flex>
            </Flex>
          </CopyTooltip>
        </MenuItem>
        <MenuItem
          onClick={() => {
            void openBlockExplorerAddress(currentNetwork, address)
          }}
        >
          <Flex alignItems="center" gap={2}>
            <NetworkPrimaryIcon />
            View on {blockExplorerTitle}
          </Flex>
        </MenuItem>
      </MenuList>
    </Menu>
  )
}

interface TokenPriceProps {
  token: Token
  onClick: () => void
  showCurrencyValue?: boolean
}

const ReceiveToken: FC<TokenPriceProps> = ({ token, onClick }) => {
  if (!token) {
    return <></>
  }

  const isVerified =
    token.tags?.includes("verified") ||
    token.tags?.includes("avnuVerified") ||
    token.tags?.includes("communityVerified")

  const isUnruggable = token.tags?.includes("unruggable")

  const typeIcons = [
    isVerified && (
      <Tooltip label="Verified" aria-label="Verified">
        <Box position="relative">
          <VerifiedPrimaryIcon key="verified" color="icon-success" />
        </Box>
      </Tooltip>
    ),
    isUnruggable && (
      <Tooltip label="Unruggable" aria-label="Unruggable">
        <Box position="relative">
          <UnruggableIcon key="unruggable" />
        </Box>
      </Tooltip>
    ),
  ]

  return (
    <TokenButton
      w="100%"
      onClick={onClick}
      name={token.name || ""}
      image={token.iconUrl || ""}
      getTokenIconUrl={getTokenIconUrl}
      symbol={token.symbol || ""}
      showTokenSymbol
      optionsButton={<OptionsMenu address={token.address} />}
      tokenTypeIcons={typeIcons}
    />
  )
}

export { ReceiveToken }
