import { Button, icons } from "@argent/ui"
import { Menu, MenuButton, MenuItem, MenuList, Portal } from "@chakra-ui/react"
import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { settingsStore } from "../../../shared/settings"
import { useKeyValueStorage } from "../../../shared/storage/hooks"
import { isDeprecated } from "../../../shared/wallet.service"
import { routes } from "../../routes"
import { upgradeAccount } from "../../services/backgroundAccounts"
import {
  openBlockExplorerAddress,
  useBlockExplorerTitle,
} from "../../services/blockExplorer.service"
import { useCurrentNetwork } from "../networks/useNetworks"
import { Account } from "./Account"
import { getAccountName, useAccountMetadata } from "./accountMetadata.state"

const { MoreIcon, ExpandIcon, HideIcon, PluginIcon, AlertIcon, EditIcon } =
  icons

export interface AccountListScreenItemMenuProps {
  account: Account
  onAccountNameEdit: () => void
}

export const AccountListScreenItemMenu: FC<AccountListScreenItemMenuProps> = ({
  account,
  onAccountNameEdit,
}) => {
  const currentNetwork = useCurrentNetwork()
  const navigate = useNavigate()
  const blockExplorerTitle = useBlockExplorerTitle()
  const { accountNames } = useAccountMetadata()
  const accountName = getAccountName(account, accountNames)

  const experimentalPluginAccount = useKeyValueStorage(
    settingsStore,
    "experimentalPluginAccount",
  )

  const showDelete =
    account && (isDeprecated(account) || account.networkId === "localhost")

  const handleHideOrDeleteAccount = async (account: Account) => {
    if (showDelete) {
      navigate(routes.accountDeleteConfirm(account.address))
    } else {
      navigate(routes.accountHideConfirm(account.address))
    }
  }

  const canUpgradeToPluginAccount =
    experimentalPluginAccount &&
    account &&
    currentNetwork.accountClassHash?.argentPluginAccount &&
    account.type !== "argent-plugin"

  return (
    <Menu isLazy size="2xs">
      <MenuButton
        aria-label={`${accountName} options`}
        backgroundColor="black"
        colorScheme="transparent"
        padding="1.5"
        fontSize="xl"
        size="auto"
        rounded="full"
        as={Button}
      >
        <MoreIcon />
      </MenuButton>
      <Portal>
        <MenuList>
          <MenuItem
            onClick={() =>
              account &&
              openBlockExplorerAddress(currentNetwork, account.address)
            }
            icon={<ExpandIcon />}
          >
            View on {blockExplorerTitle}
          </MenuItem>
          <MenuItem onClick={onAccountNameEdit} icon={<EditIcon />}>
            Edit name
          </MenuItem>
          <MenuItem
            onClick={() => handleHideOrDeleteAccount(account)}
            icon={<HideIcon />}
          >
            {showDelete ? "Delete" : "Hide"} account
          </MenuItem>
          {canUpgradeToPluginAccount && (
            <MenuItem
              onClick={() => upgradeAccount(account, "argent-plugin")}
              icon={<PluginIcon />}
            >
              Use Plugins
            </MenuItem>
          )}
          <MenuItem
            onClick={() => navigate(routes.exportPrivateKey())}
            icon={<AlertIcon />}
          >
            Export private key
          </MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  )
}
