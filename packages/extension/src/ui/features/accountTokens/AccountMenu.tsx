import { MoreVertSharp } from "@mui/icons-material"
import { FC, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { EditIcon } from "../../components/Icons/AccountMenu/EditIcon"
import { ViewOnVoyagerIcon } from "../../components/Icons/AccountMenu/ViewOnVoyagerIcon"
import { WarningIcon } from "../../components/Icons/AccountMenu/WarningIcon"
import useOnClickOutside from "../../hooks/useOnClickOutside"
import { routes } from "../../routes"
import { openVoyager } from "../../services/voyager.service"
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
  justify-content: center;
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
  padding: 5px 0 6px;
  gap: 6px;
  font-weight: 400;
  font-size: 12px;
  line-height: 140%;
  text-align: right;
  color: rgba(255, 255, 255, 0.7);
`

interface AccountNameProps {
  onAccountNameEdit: () => void
}

export const AccountMenu: FC<AccountNameProps> = ({ onAccountNameEdit }) => {
  const [isMenuOpen, setMenuOpen] = useState<boolean>(false)
  const ref = useRef<HTMLDivElement>(null)
  const currentNetwork = useCurrentNetwork()
  const navigate = useNavigate()

  useOnClickOutside(ref, () => setMenuOpen(false))

  const handleEditClick = () => {
    setMenuOpen(false)
    onAccountNameEdit()
  }

  return (
    <MenuContainer ref={ref}>
      <StyledMoreVert onClick={() => setMenuOpen(!isMenuOpen)} />
      {isMenuOpen && (
        <Menu>
          <MenuItemWrapper onClick={() => openVoyager(currentNetwork)}>
            <MenuItem>
              <ViewOnVoyagerIcon />
              View on Voyager
            </MenuItem>
          </MenuItemWrapper>
          <Separator />
          <MenuItemWrapper onClick={handleEditClick}>
            <MenuItem>
              <EditIcon /> Edit Name
            </MenuItem>
          </MenuItemWrapper>
          <Separator />
          <MenuItemWrapper onClick={() => navigate(routes.exportPrivateKey())}>
            <MenuItem>
              <WarningIcon /> Export Private Key
            </MenuItem>
          </MenuItemWrapper>
        </Menu>
      )}
    </MenuContainer>
  )
}
