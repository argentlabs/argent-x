import Dialog from "@mui/material/Dialog"
import { FC } from "react"
import styled from "styled-components"

export interface CustomDialogProps {
  isOpen: boolean
  onCancel: () => void
  children?: React.ReactNode
}

export const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    border-radius: 8px;
    max-width: 250px;
    padding: 18px;
    background: ${({ theme }) => theme.bg6};
  }
`

export const CustomDialog: FC<CustomDialogProps> = ({
  isOpen,
  onCancel,
  children,
  ...props
}) => {
  return (
    <StyledDialog
      open={isOpen}
      onClose={onCancel}
      aria-labelledby="custom-dialog-title"
      aria-describedby="custom-dialog-description"
      {...props}
    >
      {children}
    </StyledDialog>
  )
}
