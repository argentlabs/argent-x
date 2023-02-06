import { icons } from "@argent/ui"
import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react"
import { FC } from "react"
import CopyToClipboard from "react-copy-to-clipboard"
import { useNavigate } from "react-router-dom"

import { VisibilityOff } from "../../components/Icons/MuiIcons"
import { IconWrapper } from "../../components/Menu"
import { routes } from "../../routes"
import { normalizeAddress } from "../../services/addresses"
import {
  openBlockExplorerAddress,
  useBlockExplorerTitle,
} from "../../services/blockExplorer.service"
import { useCurrentNetwork } from "../networks/useNetworks"

const { MoreIcon } = icons

export interface TokenMenuProps {
  tokenAddress: string
  canHideToken?: boolean
}

export const TokenMenu: FC<TokenMenuProps> = ({
  tokenAddress,
  canHideToken = true,
}) => {
  const navigate = useNavigate()
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
          <MoreIcon />
        </MenuButton>
        <MenuList>
          <CopyToClipboard text={normalizeAddress(tokenAddress)}>
            <MenuItem>Copy address</MenuItem>
          </CopyToClipboard>
          <MenuItem
            onClick={() =>
              openBlockExplorerAddress(currentNetwork, tokenAddress)
            }
          >
            View on {blockExplorerTitle}
          </MenuItem>
          {canHideToken && (
            <>
              <MenuItem
                onClick={() => navigate(routes.hideToken(tokenAddress))}
              >
                <IconWrapper>
                  <VisibilityOff fontSize="inherit" htmlColor="white" />
                </IconWrapper>
                Hide this token
              </MenuItem>
            </>
          )}
        </MenuList>
      </Menu>
    </>
  )
}
