import type { Address } from "@argent/x-shared"
import {
  icons,
  useBlockExplorerOnOpenAddress,
  useBlockExplorerTitle,
} from "@argent/x-ui"
import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react"
import copy from "copy-to-clipboard"
import { useState } from "react"

import { useView } from "../../views/implementation/react"
import { selectedNetworkIdView } from "../../views/network"

const { MoreSecondaryIcon, CopyPrimaryIcon } = icons

interface OptionMenuProps {
  address?: Address
  canHideToken?: boolean
  onHideToken?: () => void
  onHideAndReportSpamToken?: () => void
}

export const OptionMenu = ({
  address,
  canHideToken,
  onHideToken,
  onHideAndReportSpamToken,
}: OptionMenuProps) => {
  const blockExplorerTitle = useBlockExplorerTitle()
  const blockExplorerOnOpenAddress = useBlockExplorerOnOpenAddress()
  const selectedNetworkId = useView(selectedNetworkIdView)
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    if (address) {
      copy(address)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 500)
    }
  }
  return (
    <Menu closeOnSelect={false}>
      <MenuButton mr={2}>
        <MoreSecondaryIcon color="icon-icon" />
      </MenuButton>
      <MenuList>
        {address && (
          <MenuItem onClick={handleCopy}>
            Copy token address{" "}
            {copied && <CopyPrimaryIcon w="5" h="5" ml={3} />}{" "}
          </MenuItem>
        )}
        <MenuItem
          data-address={address}
          onClick={() =>
            void blockExplorerOnOpenAddress({
              address: address ?? "",
              networkId: selectedNetworkId,
            })
          }
        >
          View on {blockExplorerTitle}
        </MenuItem>
        {canHideToken && <MenuItem onClick={onHideToken}>Hide token</MenuItem>}
        {canHideToken && (
          <MenuItem onClick={onHideAndReportSpamToken}>
            Hide and report as spam
          </MenuItem>
        )}
      </MenuList>
    </Menu>
  )
}
