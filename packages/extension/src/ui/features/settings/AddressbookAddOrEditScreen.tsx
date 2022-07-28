import { isFunction, uniqueId } from "lodash-es"
import { FC, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"

import {
  addAddressBookContact,
  editAddressBookContact,
  removeAddressBookContact,
} from "../../../shared/addressBook"
import { addressBookContactNoIdSchema } from "../../../shared/addressBook/schema"
import { AddressBookContactNoId } from "../../../shared/addressBook/type"
import { Button, ButtonTransparent } from "../../components/Button"
import Column, { ColumnCenter } from "../../components/Column"
import { DeleteDialog } from "../../components/DeleteDialog"
import { AddRoundedIcon } from "../../components/Icons/MuiIcons"
import { EditRoundedIcon } from "../../components/Icons/MuiIcons"
import { StyledControlledSelect } from "../../components/InputSelect"
import {
  StyledControlledInput,
  StyledControlledTextArea,
} from "../../components/InputText"
import Row, { RowCentered } from "../../components/Row"
import { useAddressBook } from "../../services/addressBook"
import { FormErrorAlt, H3 } from "../../theme/Typography"
import { useCurrentNetwork, useNetworks } from "../networks/useNetworks"
import { useYupValidationResolver } from "./useYupValidationResolver"

const Wrapper = styled(ColumnCenter)`
  padding: 56px 24px 32px;
  gap: 32px;
  justify-content: space-between;
  position: relative;
`

const IconWrapper = styled(RowCentered)`
  height: 64px;
  width: 64px;

  background-color: ${({ theme }) => theme.bg2};
  border-radius: 100px;
`

const StyledAddIcon = styled(AddRoundedIcon)`
  font-size: 36px;
  fill: ${({ theme }) => theme.text2};
`

const StyledEditIcon = styled(EditRoundedIcon)`
  font-size: 36px;
  fill: ${({ theme }) => theme.text2};
`

const StyledContactForm = styled.form<{ formHeight?: string }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  height: ${({ formHeight }) => (formHeight ? formHeight : "62vh")};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
`

const RemoveContactButton = styled(ButtonTransparent)`
  font-weight: 400;
  font-size: 15px;
  line-height: 20px;

  color: ${({ theme }) => theme.text3};
  margin-top: 12px;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`

type mode = "add" | "edit"

export interface AddressbookAddOrEditProps {
  networkDisabled?: boolean
  onSave?: () => void
  onCancel?: () => void
  formHeight?: string
  recipientAddress?: string
}

export const AddressbookAddOrEditScreen: FC<AddressbookAddOrEditProps> = ({
  networkDisabled,
  onSave,
  onCancel,
  formHeight,
  recipientAddress,
  ...props
}) => {
  const { contactId } = useParams<{ contactId?: string }>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const navigate = useNavigate()

  const { contacts } = useAddressBook()

  const selectedContact = contactId
    ? contacts.find((contact) => contact.id === contactId)
    : undefined

  const currentMode: mode = selectedContact ? "edit" : "add"

  const resolver = useYupValidationResolver(addressBookContactNoIdSchema)

  const currentNetwork = useCurrentNetwork()

  const networks = useNetworks()

  const networksToOptions = useMemo(
    () =>
      networks.map((network) => ({ label: network.name, value: network.id })),
    [networks],
  )

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressBookContactNoId>({
    defaultValues: {
      address: selectedContact?.address || recipientAddress || "",
      name: selectedContact?.name ?? "",
      networkId: selectedContact?.networkId ?? currentNetwork.id,
    },
    resolver,
  })

  const handleAddOrEditContact = async (
    addressBookContactNoId: AddressBookContactNoId,
  ) => {
    if (currentMode === "add") {
      await addAddressBookContact({
        ...addressBookContactNoId,
        id: uniqueId("addressbook-contact"),
      })
    }

    if (currentMode === "edit" && selectedContact?.id) {
      await editAddressBookContact({
        ...addressBookContactNoId,
        id: selectedContact.id,
      })
    }

    isFunction(onSave) ? onSave() : navigate(-1)
  }

  const handleDelete = async () => {
    selectedContact && (await removeAddressBookContact(selectedContact))
    setDeleteDialogOpen(false)
    navigate(-1)
  }

  return (
    <Wrapper {...props}>
      <DeleteDialog
        isOpen={deleteDialogOpen}
        title="Delete contact"
        content="Are you sure you want to delete this contact from your address book?"
        onDelete={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
      <ColumnCenter gap="16px">
        <IconWrapper>
          {currentMode === "add" && <StyledAddIcon />}
          {currentMode === "edit" && <StyledEditIcon />}
        </IconWrapper>

        {currentMode === "add" && <H3>New address</H3>}
        {currentMode === "edit" && <H3>Edit address</H3>}
      </ColumnCenter>

      <StyledContactForm
        onSubmit={handleSubmit(
          async (contact) => await handleAddOrEditContact(contact),
        )}
        formHeight={formHeight}
      >
        <Column gap="12px">
          <div>
            <StyledControlledInput
              name="name"
              placeholder="Name"
              autoComplete="off"
              autoFocus
              control={control}
              type="text"
            />
            {errors.name && <FormErrorAlt>{errors.name.message}</FormErrorAlt>}
          </div>

          <div>
            <StyledControlledTextArea
              name="address"
              placeholder="Starknet Address"
              autoComplete="false"
              control={control}
              minRows={3}
              maxRows={3}
            />
            {errors.address && (
              <FormErrorAlt>{errors.address.message}</FormErrorAlt>
            )}
          </div>

          <div>
            <StyledControlledSelect
              name="networkId"
              options={networksToOptions}
              defaultValue={currentNetwork.id}
              control={control}
              placeholder="Network"
              classNamePrefix="network-selector"
              isDisabled={networkDisabled}
            />
          </div>

          {selectedContact && currentMode === "edit" && (
            <RemoveContactButton
              type="button"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Remove from address book
            </RemoveContactButton>
          )}
        </Column>

        <Row gap="12px">
          <Button
            type="button"
            onClick={() => (isFunction(onCancel) ? onCancel() : navigate(-1))}
          >
            Cancel
          </Button>
          <Button>Save</Button>
        </Row>
      </StyledContactForm>
    </Wrapper>
  )
}
