import { FC } from "react"
import styled from "styled-components"

import {
  AddressbookAddOrEditProps,
  AddressbookAddOrEditScreen,
} from "../features/settings/AddressbookAddOrEditScreen"
import { CustomBottomSheet, CustomBottomSheetProps } from "./BottomSheet"

const StyledAddressBookAdd = styled(AddressbookAddOrEditScreen)`
  padding-top: 40px;
`

export const AddContactBottomSheet: FC<
  CustomBottomSheetProps & AddressbookAddOrEditProps
> = ({ onSave, onCancel, open, recipientAddress }) => {
  return (
    <CustomBottomSheet onClose={onCancel} open={open}>
      {/** Mount only when open to get the correct recipientAddress **/}
      {open && (
        <StyledAddressBookAdd
          networkDisabled
          onSave={onSave}
          onCancel={onCancel}
          formHeight={"58vh"}
          recipientAddress={recipientAddress}
        />
      )}
    </CustomBottomSheet>
  )
}
