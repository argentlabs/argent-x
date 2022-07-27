import { FC } from "react"
import styled from "styled-components"
import { DialogContentText, H3 } from "../theme/Typography"
import { Button } from "./Button"
import { ColumnCenter } from "./Column"
import { CustomDialog } from "./CustomDialog"
import Row from "./Row"
import { darken } from "polished"

export interface DeleteDialogProps {
  onDelete: () => void
  onCancel: () => void
  isOpen: boolean
  title?: string
  content?: string
  children?: React.ReactNode
}

const DeleteButtonGroup = styled(Row)`
  margin-top: 8px;
  gap: 16px;
`
const CancelButton = styled(Button)`
  background-color: ${({ theme }) => theme.text3};
`
const DeleteButton = styled(Button)`
  background-color: ${({ theme }) => theme.red1};

  &:hover {
    background-color: ${({ theme }) => darken(0.1, theme.red1)};
  }
`

export const DeleteDialog: FC<DeleteDialogProps> = ({
  isOpen,
  title,
  onDelete,
  onCancel,
  content,
  children,
  ...props
}) => {
  return (
    <CustomDialog isOpen={isOpen} onCancel={onCancel} {...props}>
      <ColumnCenter gap="16px">
        <H3>{title}</H3>
        <DialogContentText>{content}</DialogContentText>
        {children}
        <DeleteButtonGroup>
          <CancelButton onClick={onCancel}>Cancel</CancelButton>
          <DeleteButton onClick={onDelete}>Delete</DeleteButton>
        </DeleteButtonGroup>
      </ColumnCenter>
    </CustomDialog>
  )
}
