import { iconsDeprecated } from "@argent/x-ui"
import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react"
import { FC } from "react"
import CopyToClipboard from "react-copy-to-clipboard"
import { useNavigate } from "react-router-dom"

import { VisibilityOff } from "../../components/Icons/MuiIcons"
import { routes } from "../../../shared/ui/routes"
import {
  openBlockExplorerAddress,
  useBlockExplorerTitle,
} from "../../services/blockExplorer.service"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { normalizeAddress } from "@argent/x-shared"

const { MoreIcon } = iconsDeprecated

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
              void openBlockExplorerAddress(currentNetwork, tokenAddress)
            }
          >
            View on {blockExplorerTitle}
          </MenuItem>
          {canHideToken && (
            <>
              <MenuItem
                onClick={() => navigate(routes.hideToken(tokenAddress))}
                icon={<VisibilityOff fontSize="inherit" htmlColor="white" />}
              >
                Hide this token
              </MenuItem>
            </>
          )}
        </MenuList>
      </Menu>
    </>
  )
}
