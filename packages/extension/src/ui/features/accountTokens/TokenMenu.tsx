import { MoreSecondaryIcon } from "@argent/x-ui/icons"
import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react"
import type { FC } from "react"
import CopyToClipboard from "react-copy-to-clipboard"

import {
  openBlockExplorerAddress,
  useBlockExplorerTitle,
} from "../../services/blockExplorer.service"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { normalizeAddress } from "@argent/x-shared"

export interface TokenMenuProps {
  tokenAddress: string
}

export const TokenMenu: FC<TokenMenuProps> = ({ tokenAddress }) => {
  const currentNetwork = useCurrentNetwork()
  const blockExplorerTitle = useBlockExplorerTitle()

  return (
    <>
      <Menu>
        <MenuButton
          aria-label="NFT actions"
          color="neutrals.200"
          colorScheme="transparent"
          padding="1.5"
          fontSize="xl"
          size="auto"
          rounded="full"
          as={Button}
        >
          <MoreSecondaryIcon />
        </MenuButton>
        <MenuList>
          <CopyToClipboard text={normalizeAddress(tokenAddress)}>
            <MenuItem>Copy address</MenuItem>
          </CopyToClipboard>
          <MenuItem
            onClick={() =>
              void openBlockExplorerAddress(currentNetwork, tokenAddress)
            }
          >
            View on {blockExplorerTitle}
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  )
}
