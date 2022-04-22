import RemoveIcon from "@mui/icons-material/Remove"
import { FC } from "react"
import styled from "styled-components"

import { IconButton } from "./IconButton"

const DappWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 8px 8px 16px;
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.15);

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
  padding: 9px 0;
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

interface DappConnectionProps {
  host: string
  hideRemove?: boolean
  onClick?: () => void
  onRemoveClick?: () => void
}

export const DappConnection: FC<DappConnectionProps> = ({
  host,
  hideRemove = false,
  onClick,
  onRemoveClick,
  ...props
}) => {
  return (
    <DappWrapper {...props} onClick={onClick}>
      <DappDetailsWrapper>
        <DappTextGroup>
          <DappTitle>{host}</DappTitle>
        </DappTextGroup>
        {!hideRemove && (
          <RemoveConnectionIconButton
            size={40}
            onClick={(e) => {
              e.stopPropagation()
              onRemoveClick?.()
            }}
          >
            <RemoveIcon />
          </RemoveConnectionIconButton>
        )}
      </DappDetailsWrapper>
    </DappWrapper>
  )
}
