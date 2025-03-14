import type { Address } from "@argent/x-shared"
import { MoreSecondaryIcon } from "@argent/x-ui/icons"
import {
  useBlockExplorerOnOpenAddress,
  useBlockExplorerTitle,
} from "@argent/x-ui"
import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react"

import { useView } from "../../views/implementation/react"
import { selectedNetworkIdView } from "../../views/network"

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

  return (
    <Menu closeOnSelect={false}>
      <MenuButton mr={2}>
        <MoreSecondaryIcon color="icon-icon" />
      </MenuButton>
      <MenuList>
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
