import { MoreVertSharp, VisibilityOff } from "@mui/icons-material"
import { FC, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { EditIcon } from "../../components/Icons/AccountMenu/EditIcon"
import { ViewOnVoyagerIcon } from "../../components/Icons/AccountMenu/ViewOnVoyagerIcon"
import { WarningIcon } from "../../components/Icons/AccountMenu/WarningIcon"
import { routes } from "../../routes"
import { deleteAccount } from "../../services/messaging"
import { useOnClickOutside } from "../../services/useOnClickOutside"
import { openVoyagerAddress } from "../../services/voyager.service"
import { Account } from "../accounts/Account"
import { useAccounts, useSelectedAccount } from "../accounts/accounts.state"
import { useCurrentNetwork } from "../networks/useNetworks"

const StyledMoreVert = styled(MoreVertSharp)`
  cursor: pointer;
`

const MenuContainer = styled.div`
  position: relative;
`

const Menu = styled.div`
  position: absolute;
  top: 95%;
  right: 45%;
  background-color: #474747;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 134px;
`

const Separator = styled.div`
  border-top: 1px solid #525252;
  width: 100%;
`

const MenuItemWrapper = styled.div`
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

const MenuItem = styled.div`
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

const IconWrapper = styled.div`
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
  const { hideAccount } = useAccounts()

  const account = useSelectedAccount()

  useOnClickOutside(ref, () => setMenuOpen(false))

  const handleEditClick = () => {
    setMenuOpen(false)
    onAccountNameEdit()
  }

  const handleHideAccount = async (account: Account) => {
    hideAccount(account)
    await deleteAccount(account.address)
    navigate(routes.accounts())
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
            <MenuItemWrapper onClick={() => handleHideAccount(account)}>
              <MenuItem>
                <IconWrapper>
                  <VisibilityOff fontSize={"inherit"} htmlColor={"white"} />
                </IconWrapper>
                Hide Account
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
