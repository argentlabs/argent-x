import { FC } from "react"
import styled from "styled-components"

import { DialogMessageText, H3 } from "../theme/Typography"
import { Button } from "./Button"
import { ColumnCenter } from "./Column"
import { CustomDialog, CustomDialogProps } from "./CustomDialog"
import Row from "./Row"

export interface IAlertDialog extends CustomDialogProps {
  cancelTitle?: string
  onDestroy?: () => void
  destroyTitle?: string
  onConfirm?: () => void
  confirmTitle?: string
  title: string
  message?: string
}

const ContentContainer = styled(ColumnCenter)`
  gap: 16px;
`

const ButtonGroup = styled(Row)`
  margin-top: 8px;
  gap: 16px;
`

const AlertButton = styled(Button)`
  white-space: nowrap;
`

export const AlertDialog: FC<IAlertDialog> = ({
  title,
  onDestroy,
  destroyTitle = "Delete",
  onCancel,
  cancelTitle = "Cancel",
  onConfirm,
  confirmTitle = "OK",
  message,
  children,
  ...rest
}) => {
  return (
    <CustomDialog onCancel={onCancel} {...rest}>
      <ContentContainer>
        <H3>{title}</H3>
        {message && <DialogMessageText>{message}</DialogMessageText>}
        {children}
        <ButtonGroup>
          <AlertButton onClick={onCancel}>{cancelTitle}</AlertButton>
          {!!onDestroy && (
            <AlertButton variant="danger" onClick={onDestroy}>
              {destroyTitle}
            </AlertButton>
          )}
          {!!onConfirm && (
            <AlertButton variant="primary" onClick={onConfirm}>
              {confirmTitle}
            </AlertButton>
          )}
        </ButtonGroup>
      </ContentContainer>
    </CustomDialog>
  )
}
