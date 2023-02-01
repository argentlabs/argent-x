import { FC, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { settingsStore } from "../../../shared/settings"
import { useKeyValueStorage } from "../../../shared/storage/hooks"
import { isDeprecated } from "../../../shared/wallet.service"
import { EditIcon } from "../../components/Icons/EditIcon"
import { MoreVertSharp, VisibilityOff } from "../../components/Icons/MuiIcons"
import { PluginIcon } from "../../components/Icons/PluginIcon"
import { ViewOnBlockExplorerIcon } from "../../components/Icons/ViewOnBlockExplorerIcon"
import { WarningIcon } from "../../components/Icons/WarningIcon"
import { routes } from "../../routes"
import { upgradeAccount } from "../../services/backgroundAccounts"
import {
  openBlockExplorerAddress,
  useBlockExplorerTitle,
} from "../../services/blockExplorer.service"
import { useOnClickOutside } from "../../services/useOnClickOutside"
import { Account } from "../accounts/Account"
import { useSelectedAccount } from "../accounts/accounts.state"
import { useCurrentNetwork } from "../networks/useNetworks"

export const StyledMoreVert = styled(MoreVertSharp)`
  cursor: pointer;
`

export const MenuContainer = styled.div`
  position: relative;
`

export const Menu = styled.div`
  position: absolute;
  top: 95%;
  right: 45%;
  background-color: ${({ theme }) => theme.bg3};
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 134px;
  z-index: 100;
`

export const Separator = styled.div`
  border-top: 1px solid #525252;
  width: 100%;
`

export const MenuItemWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background-color: transparent;
  cursor: pointer;

  &:hover {
    background-color: rgba(255, 255, 255, 0.4);
  }
`

export const MenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 5px 0px 6px 10px;
  gap: 6px;
  font-weight: 400;
  font-size: 12px;
  line-height: 140%;
  text-align: right;
  color: rgba(255, 255, 255, 0.7);
`

export const IconWrapper = styled.div`
  height: 13px;
  width: 12px;
  font-size: 12px;
`

interface AccountNameProps {
  onAccountNameEdit: () => void
}

export const DeprecatedAccountMenu: FC<AccountNameProps> = ({
  onAccountNameEdit,
}) => {
  const [isMenuOpen, setMenuOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const currentNetwork = useCurrentNetwork()
  const navigate = useNavigate()
  const blockExplorerTitle = useBlockExplorerTitle()

  const account = useSelectedAccount()
  const experimentalPluginAccount = useKeyValueStorage(
    settingsStore,
    "experimentalPluginAccount",
  )

  useOnClickOutside(ref, () => setMenuOpen(false))

  const handleEditClick = () => {
    setMenuOpen(false)
    onAccountNameEdit()
  }

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
    currentNetwork.accountClassHash?.plugin &&
    account.type !== "plugin"

  return (
    <MenuContainer ref={ref}>
      <StyledMoreVert onClick={() => setMenuOpen(!isMenuOpen)} />
      {isMenuOpen && (
        <Menu>
          <MenuItemWrapper
            onClick={() =>
              account &&
              openBlockExplorerAddress(currentNetwork, account.address)
            }
          >
            <MenuItem>
              <ViewOnBlockExplorerIcon />
              View on {blockExplorerTitle}
            </MenuItem>
          </MenuItemWrapper>
          <Separator />
          <MenuItemWrapper onClick={handleEditClick}>
            <MenuItem>
              <EditIcon /> Edit name
            </MenuItem>
          </MenuItemWrapper>
          {account && (
            <>
              <Separator />
              <MenuItemWrapper
                onClick={() => handleHideOrDeleteAccount(account)}
              >
                <MenuItem>
                  <IconWrapper>
                    <VisibilityOff fontSize="inherit" htmlColor="white" />
                  </IconWrapper>
                  {showDelete ? "Delete" : "Hide"} account
                </MenuItem>
              </MenuItemWrapper>
            </>
          )}
          {canUpgradeToPluginAccount && (
            <>
              <Separator />
              <MenuItemWrapper
                onClick={() => upgradeAccount(account, "plugin")}
              >
                <MenuItem>
                  <IconWrapper>
                    <PluginIcon fontSize="inherit" />
                  </IconWrapper>
                  Use Plugins
                </MenuItem>
              </MenuItemWrapper>
            </>
          )}
          <Separator />
          <MenuItemWrapper onClick={() => navigate(routes.exportPrivateKey())}>
            <MenuItem>
              <WarningIcon /> Export private key
            </MenuItem>
          </MenuItemWrapper>
        </Menu>
      )}
    </MenuContainer>
  )
}
