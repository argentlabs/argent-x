import RemoveIcon from "@mui/icons-material/Remove"
import { FC } from "react"
import styled from "styled-components"

import { IconButton } from "../IconButton"

const DappWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;

  transition: all 200ms ease-in-out;

  &:hover,
  &:focus {
    outline: 0;
    background: rgba(255, 255, 255, 0.25);
  }
`

const DappDetailsWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const DappTextGroup = styled.div`
  display: flex;
  flex-direction: column;
`

const DappTitle = styled.h3`
  font-weight: 600;
  font-size: 17px;
  line-height: 22px;
  margin: 0;
`

const RemoveConnectionIconButton = styled(IconButton)`
  &:hover,
  &:focus {
    background-color: rgba(255, 255, 255, 0.15);
    outline: 0;
  }
`

interface DappListItemProps {
  host: string
  onClick?: () => void
}

export const DappListItem: FC<DappListItemProps> = ({ host, onClick }) => {
  return (
    <DappWrapper>
      <DappDetailsWrapper>
        <DappTextGroup>
          <DappTitle>{host}</DappTitle>
        </DappTextGroup>
        <RemoveConnectionIconButton size={40} onClick={onClick}>
          <RemoveIcon />
        </RemoveConnectionIconButton>
      </DappDetailsWrapper>
    </DappWrapper>
  )
}
