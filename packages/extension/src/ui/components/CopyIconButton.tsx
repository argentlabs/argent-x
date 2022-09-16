import copy from "copy-to-clipboard"
import { FC, ReactNode, useCallback } from "react"
import styled from "styled-components"

import { IIconButton, IconButton } from "./Button"
import { CheckCircleIcon, ContentCopyIcon } from "./Icons/MuiIcons"

const CopyIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

const ClickedIconContainer = styled.div`
  color: ${({ theme }) => theme.green1};
  display: flex;
  align-items: center;
  justify-content: center;
`

export interface ICopyIconButton
  extends Omit<IIconButton, "icon" | "clickedIcon"> {
  icon?: ReactNode
  clickedIcon?: ReactNode
  copyValue: string
}

export const CopyIconButton: FC<ICopyIconButton> = ({
  copyValue,
  icon = (
    <CopyIconContainer>
      <ContentCopyIcon fontSize="inherit" />
    </CopyIconContainer>
  ),
  clickedIcon = (
    <ClickedIconContainer>
      <CheckCircleIcon fontSize="inherit" />
    </ClickedIconContainer>
  ),
  ...rest
}) => {
  const onClick = useCallback(() => {
    copy(copyValue)
  }, [copyValue])
  return (
    <IconButton
      icon={icon}
      clickedIcon={clickedIcon}
      onClick={onClick}
      {...rest}
    />
  )
}
