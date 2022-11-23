import { ButtonCell } from "@argent/ui"
import { FC } from "react"
import styled from "styled-components"

import { IconButton } from "../../components/IconButton"
import { RemoveIcon } from "../../components/Icons/MuiIcons"

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
    <ButtonCell
      rightIcon={
        <>
          {!hideRemove && (
            <RemoveConnectionIconButton
              size={40}
              onClick={(e) => {
                e.stopPropagation()
                onRemoveClick?.()
              }}
            >
              {/* TODO: need icon from design */}
              <RemoveIcon />
            </RemoveConnectionIconButton>
          )}
        </>
      }
      width="100%"
      onClick={onClick}
      {...props}
    >
      {host}
    </ButtonCell>
  )
}
