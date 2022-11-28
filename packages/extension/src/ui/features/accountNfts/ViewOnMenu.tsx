import { icons, logos } from "@argent/ui"
import {
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react"
import { FC, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useBlockExplorerTitle } from "../../services/blockExplorer.service"
import { useOnClickOutside } from "../../services/useOnClickOutside"
import { useCurrentNetwork } from "../networks/useNetworks"
import { openAspectNft } from "./aspect.service"
import { openMintSquareNft } from "./mint-square.service"

const { DropdownDownIcon } = icons
const { Aspect, Mintsquare } = logos

export interface TokenMenuProps {
  contractAddress: string
  networkId: string
  tokenId: string
}

const ViewOnMenu: FC<TokenMenuProps> = ({
  contractAddress,
  networkId,
  tokenId,
}) => {
  const [isMenuOpen, setMenuOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useOnClickOutside(ref, () => setMenuOpen(false))

  return (
    <>
      <Menu>
        <MenuButton
          aria-label="NFT actions"
          padding="1.5"
          fontSize="xl"
          size="auto"
          rounded="full"
          w="100%"
          as={Button}
        >
          <Flex justifyContent="center" alignItems="center" gap="2">
            <DropdownDownIcon />
            View on
          </Flex>
        </MenuButton>
        <MenuList>
          <MenuItem
            onClick={() => openAspectNft(contractAddress, tokenId, networkId)}
            gap="2"
          >
            <Aspect />
            View on Aspect
          </MenuItem>
          <MenuItem
            gap="2"
            onClick={() =>
              openMintSquareNft(contractAddress, tokenId, networkId)
            }
          >
            <Mintsquare />
            View on MintSquare
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  )
}

export { ViewOnMenu }
