import { BarBackButton, CellStack, NavigationContainer } from "@argent/ui"
import { Flex, VStack } from "@chakra-ui/react"
import { isFunction } from "lodash-es"
import { nanoid } from "nanoid"
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
import {
  AddressBookContact,
  AddressBookContactNoId,
} from "../../../shared/addressBook/type"
import { AlertDialog } from "../../components/AlertDialog"
import { Button, ButtonTransparent } from "../../components/Button"
import { AddRoundedIcon } from "../../components/Icons/MuiIcons"
import { EditRoundedIcon } from "../../components/Icons/MuiIcons"
import { StyledControlledSelect } from "../../components/InputSelect"
import {
  StyledControlledInput,
  StyledControlledTextArea,
} from "../../components/InputText"
import Row, { RowCentered } from "../../components/Row"
import { useAddressBook } from "../../services/addressBook"
import useDebounce from "../../services/useDebounce"
import { FormErrorAlt } from "../../theme/Typography"
import { getNetworkAccountImageUrl } from "../accounts/accounts.service"
import { useCurrentNetwork, useNetworks } from "../networks/useNetworks"
import { useYupValidationResolver } from "./useYupValidationResolver"

const IconWrapper = styled(RowCentered)`
  height: 64px;
  width: 64px;

  background-color: ${({ theme }) => theme.bg2};
  border-radius: 100px;
`

const ContactAvatar = styled.img`
  border-radius: 100px;
  height: 64px;
  width: 64px;
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
  onSave?: (savedContact: AddressBookContact) => void
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
    watch,
  } = useForm<AddressBookContactNoId>({
    defaultValues: {
      address: selectedContact?.address || recipientAddress || "",
      name: selectedContact?.name ?? "",
      networkId: selectedContact?.networkId ?? currentNetwork.id,
    },
    resolver,
  })

  const {
    name: contactName,
    address: contactAddress,
    networkId: contactNetwork,
  } = watch()

  const debouncedCName = useDebounce(contactName, 250)
  const debouncedCNetwork = useDebounce(contactNetwork, 250)
  const debouncedCAddress = useDebounce(contactAddress, 250)

  const handleAddOrEditContact = async (
    addressBookContactNoId: AddressBookContactNoId,
  ) => {
    let savedContact: AddressBookContact | undefined

    if (currentMode === "add") {
      savedContact = await addAddressBookContact({
        ...addressBookContactNoId,
        id: nanoid(),
      })
    }

    if (currentMode === "edit" && selectedContact?.id) {
      savedContact = await editAddressBookContact({
        ...addressBookContactNoId,
        id: selectedContact.id,
      })
    }

    isFunction(onSave) && savedContact ? onSave(savedContact) : navigate(-1)
  }

  const handleDelete = async () => {
    selectedContact && (await removeAddressBookContact(selectedContact))
    setDeleteDialogOpen(false)
    navigate(-1)
  }

  return (
    <NavigationContainer
      leftButton={<BarBackButton />}
      title={currentMode === "add" ? "New address" : "Edit address"}
    >
      <VStack {...props} p="4">
        <AlertDialog
          isOpen={deleteDialogOpen}
          title="Delete contact"
          message="Are you sure you want to delete this contact from your address book?"
          onDestroy={handleDelete}
          onCancel={() => setDeleteDialogOpen(false)}
        />
        <Flex pt="5" pb="10" gap="16px">
          {!debouncedCName ? (
            <IconWrapper>
              {currentMode === "add" && <StyledAddIcon />}
              {currentMode === "edit" && <StyledEditIcon />}
            </IconWrapper>
          ) : (
            <ContactAvatar
              src={getNetworkAccountImageUrl({
                accountName: debouncedCName,
                accountAddress: debouncedCAddress,
                networkId: debouncedCNetwork,
              })}
            />
          )}
        </Flex>

        <StyledContactForm
          onSubmit={handleSubmit(
            async (contact) => await handleAddOrEditContact(contact),
          )}
          formHeight={formHeight}
        >
          <CellStack p="0">
            <div>
              <StyledControlledInput
                name="name"
                placeholder="Name"
                autoComplete="off"
                autoFocus
                control={control}
                type="text"
                spellCheck={false}
              />
              {errors.name && (
                <FormErrorAlt>{errors.name.message}</FormErrorAlt>
              )}
            </div>

            <div>
              <StyledControlledTextArea
                name="address"
                placeholder="Starknet Address"
                autoComplete="false"
                control={control}
                minRows={3}
                maxRows={3}
                spellCheck={false}
                onlyAddressHex
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
          </CellStack>

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
      </VStack>
    </NavigationContainer>
  )
}
