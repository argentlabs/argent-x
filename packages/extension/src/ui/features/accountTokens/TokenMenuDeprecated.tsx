import { FC, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { VisibilityOff } from "../../components/Icons/MuiIcons"
import { MoreVertSharp } from "../../components/Icons/MuiIcons"
import { ViewOnBlockExplorerIcon } from "../../components/Icons/ViewOnBlockExplorerIcon"
import {
  IconWrapper,
  Menu,
  MenuContainer,
  MenuItem,
  MenuItemWrapper,
  Separator,
} from "../../components/Menu"
import Row, { RowCentered } from "../../components/Row"
import { routes } from "../../routes"
import {
  openBlockExplorerAddress,
  useBlockExplorerTitle,
} from "../../services/blockExplorer.service"
import { useOnClickOutside } from "../../services/useOnClickOutside"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"

const StyledMenuContainer = styled(MenuContainer)`
  flex: 1;
  text-align: right;
`

const StyledMenu = styled(Menu)`
  top: 120%;
  right: 5%;
`

const MoreVertWrapper = styled(RowCentered)`
  align-items: center;
  border-radius: 50%;
  height: 32px;
  width: 32px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.1);
`

export interface TokenMenuProps {
  tokenAddress: string
  canHideToken?: boolean
}

export const TokenMenuDeprecated: FC<TokenMenuProps> = ({
  tokenAddress,
  canHideToken = true,
}) => {
  const [isMenuOpen, setMenuOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const currentNetwork = useCurrentNetwork()
  const blockExplorerTitle = useBlockExplorerTitle()

  useOnClickOutside(ref, () => setMenuOpen(false))

  return (
    <StyledMenuContainer id="token-menu-container" style={{}} ref={ref}>
      <Row style={{ justifyContent: "flex-end" }}>
        <MoreVertWrapper onClick={() => setMenuOpen(!isMenuOpen)}>
          <MoreVertSharp />
        </MoreVertWrapper>
      </Row>
      {isMenuOpen && (
        <StyledMenu>
          {/* <CopyToClipboard
            text={normalizeAddress(tokenAddress)}
            onCopy={() => setMenuOpen(false)}
          >
            <MenuItemWrapper>
              <MenuItem>
                <ContentCopyIcon fontSize="inherit" htmlColor="white" />
                Copy address
              </MenuItem>
            </MenuItemWrapper>
          </CopyToClipboard>
          <Separator /> */}
          <MenuItemWrapper
            onClick={() =>
              openBlockExplorerAddress(currentNetwork, tokenAddress)
            }
          >
            <MenuItem>
              <ViewOnBlockExplorerIcon />
              View on {blockExplorerTitle}
            </MenuItem>
          </MenuItemWrapper>
          {canHideToken && (
            <>
              <Separator />
              <MenuItemWrapper
                onClick={() => navigate(routes.hideToken(tokenAddress))}
              >
                <MenuItem>
                  <IconWrapper>
                    <VisibilityOff fontSize="inherit" htmlColor="white" />
                  </IconWrapper>
                  Hide this token
                </MenuItem>
              </MenuItemWrapper>
            </>
          )}
        </StyledMenu>
      )}
    </StyledMenuContainer>
  )
}
