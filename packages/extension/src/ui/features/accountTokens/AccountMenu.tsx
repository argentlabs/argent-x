import { FC, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { isDeprecated } from "../../../shared/wallet.service"
import { EditIcon } from "../../components/Icons/EditIcon"
import { MoreVertSharp, VisibilityOff } from "../../components/Icons/MuiIcons"
import { ViewOnVoyagerIcon } from "../../components/Icons/ViewOnVoyagerIcon"
import { WarningIcon } from "../../components/Icons/WarningIcon"
import { routes } from "../../routes"
import { useOnClickOutside } from "../../services/useOnClickOutside"
import { openVoyagerAddress } from "../../services/voyager.service"
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
  background-color: #474747;
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

export const AccountMenu: FC<AccountNameProps> = ({ onAccountNameEdit }) => {
  const [isMenuOpen, setMenuOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const currentNetwork = useCurrentNetwork()
  const navigate = useNavigate()

  const account = useSelectedAccount()

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

  return (
    <MenuContainer ref={ref}>
      <StyledMoreVert onClick={() => setMenuOpen(!isMenuOpen)} />
      {isMenuOpen && (
        <Menu>
          <MenuItemWrapper
            onClick={() =>
              account && openVoyagerAddress(currentNetwork, account.address)
            }
          >
            <MenuItem>
              <ViewOnVoyagerIcon />
              View on Voyager
            </MenuItem>
          </MenuItemWrapper>
          <Separator />
          <MenuItemWrapper onClick={handleEditClick}>
            <MenuItem>
              <EditIcon /> Edit name
            </MenuItem>
          </MenuItemWrapper>
          <Separator />
          {account && (
            <MenuItemWrapper onClick={() => handleHideOrDeleteAccount(account)}>
              <MenuItem>
                <IconWrapper>
                  <VisibilityOff fontSize="inherit" htmlColor="white" />
                </IconWrapper>
                {showDelete ? "Delete" : "Hide"} Account
              </MenuItem>
            </MenuItemWrapper>
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
