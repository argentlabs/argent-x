import type { NavigationContainerProps, SelectOptions } from "@argent/x-ui"
import { UserSecondaryIcon, BinSecondaryIcon } from "@argent/x-ui/icons"
import {
  AlertDialog,
  BarBackButton,
  BarCloseButton,
  BarIconButton,
  CellStack,
  FieldError,
  H3,
  NavigationContainer,
  Select,
} from "@argent/x-ui"
import { starknetId } from "starknet"
import { addressInputCharactersAndLengthSchema } from "@argent/x-shared"
import {
  Button,
  Center,
  Circle,
  Flex,
  Img,
  VStack,
  Textarea,
  InputGroup,
  InputRightElement,
  Spinner,
} from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { FC, FormEvent } from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"

import { addressBookContactNoIdSchema } from "../../../../shared/addressBook/schema"
import type {
  AddressBookContact,
  AddressBookContactNoId,
} from "../../../../shared/addressBook/type"
import { isAddressBookContact } from "../../../../shared/addressBook/type"
import { ControlledInput } from "../../../components/ControlledInput"
import { getNetworkAccountImageUrl } from "../../accounts/accounts.service"
import { useGetAddressFromDomainNameInput } from "../../send/useGetAddressFromDomainName"

export interface AddressBookAddOrEditScreeProps
  extends NavigationContainerProps {
  contact?: AddressBookContactNoId | AddressBookContact
  onSave?: (
    contact: AddressBookContactNoId | AddressBookContact,
  ) => Promise<void> | void
  onDelete?: () => Promise<void> | void
  onCancel?: () => void
  networkOptions?: SelectOptions
  networkDisabled?: boolean
  addressDisabled?: boolean
  modal?: boolean
}

export const AddressBookAddOrEditScreen: FC<AddressBookAddOrEditScreeProps> = ({
  contact: selectedContact,
  onSave,
  onDelete,
  onCancel,
  networkOptions = [],
  networkDisabled,
  addressDisabled,
  modal,
  ...rest
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const isEditingExistingContact = isAddressBookContact(selectedContact)

  const resolver = zodResolver(addressBookContactNoIdSchema)

  const {
    control,
    handleSubmit,
    watch,
    register,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<AddressBookContactNoId>({
    defaultValues: {
      ...selectedContact,
    },
    resolver,
  })

  const {
    name: contactName,
    address: contactAddress,
    networkId: contactNetwork,
  } = watch()

  const {
    isLoading,
    error: starknetIdError,
    isValid: starknetAddressIsValid,
  } = useGetAddressFromDomainNameInput(contactAddress, contactNetwork)

  const contactAvatar = useMemo(() => {
    if (!contactName) {
      return
    }
    return getNetworkAccountImageUrl({
      accountName: contactName,
      accountId: `${contactAddress}-${contactNetwork}`,
    })
  }, [contactAddress, contactName, contactNetwork])

  const handleForm = handleSubmit(
    (contact: AddressBookContactNoId | AddressBookContact) => {
      if (onSave) {
        void onSave(contact)
      }
    },
  )

  const title = isEditingExistingContact ? "Edit contact" : "New contact"

  const onDeleteConfirm = useCallback(() => {
    setDeleteDialogOpen(false)
    if (onDelete) {
      void onDelete()
    }
  }, [onDelete])

  const onDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false)
  }, [])

  const rightButton = useMemo(() => {
    if (!isEditingExistingContact) {
      return
    }
    return (
      <BarIconButton
        aria-label="Remove from address book"
        onClick={() => setDeleteDialogOpen(true)}
      >
        <BinSecondaryIcon />
      </BarIconButton>
    )
  }, [isEditingExistingContact])

  const isStarknetDomainNameAddress = starknetId.isStarkDomain(contactAddress)

  useEffect(() => {
    if (isStarknetDomainNameAddress) {
      if (starknetIdError) {
        setError("address", {
          type: "custom",
          message: starknetIdError,
        })
      } else {
        clearErrors("address")
      }
    } else {
      clearErrors("address")
    }
  }, [clearErrors, isStarknetDomainNameAddress, setError, starknetIdError])

  const hasAddressError = "address" in errors
  const disableSubmit =
    isStarknetDomainNameAddress && (isLoading || !starknetAddressIsValid)

  const { onChange, ...addressRest } = register("address")

  return (
    <NavigationContainer
      leftButton={
        modal ? (
          <BarCloseButton onClick={onCancel} />
        ) : (
          <BarBackButton onClick={onCancel} />
        )
      }
      title={title}
      rightButton={rightButton}
      {...rest}
    >
      <VStack p="4" flex={1}>
        <AlertDialog
          isOpen={deleteDialogOpen}
          title="Delete contact"
          message="Are you sure you want to delete this contact?"
          onDestroy={onDeleteConfirm}
          onCancel={onDeleteCancel}
        />
        <Center flexDirection={"column"} gap={6} pb={6}>
          <Circle
            overflow={"hidden"}
            size={16}
            bg={"neutrals.800"}
            alignItems={"center"}
          >
            {contactName ? (
              <Img w={20} h={20} src={contactAvatar} />
            ) : (
              <UserSecondaryIcon fontSize={32} />
            )}
          </Circle>
          <H3>{title}</H3>
        </Center>
        <CellStack
          as="form"
          display={"flex"}
          flex={1}
          w={"full"}
          p={0}
          onSubmit={(e: FormEvent) => void handleForm(e)}
        >
          <ControlledInput
            name="name"
            placeholder="Name"
            autoComplete="off"
            control={control}
            type="text"
            spellCheck={false}
            autoFocus
          />

          <InputGroup>
            <Textarea
              {...addressRest}
              placeholder="Starknet Address or Starknet ID"
              autoComplete="false"
              spellCheck={false}
              rows={3}
              resize={"none"}
              value={contactAddress}
              isDisabled={addressDisabled}
              isInvalid={hasAddressError}
              onChange={(e) => {
                if (
                  addressInputCharactersAndLengthSchema.safeParse(
                    e.target.value,
                  ).success
                ) {
                  void onChange(e)
                }
              }}
            />
            {isLoading && (
              <InputRightElement pointerEvents="none" h={"full"}>
                <Spinner size={"sm"} />
              </InputRightElement>
            )}
          </InputGroup>
          {hasAddressError && (
            <FieldError>{errors.address?.message}</FieldError>
          )}

          <Controller
            name="networkId"
            control={control}
            render={({
              field: { onChange, name, value },
              fieldState: { error },
            }) => (
              <>
                <div aria-label="network-selector">
                  <Select
                    placeholder="Network"
                    name={name}
                    onChange={onChange}
                    options={networkOptions}
                    value={value}
                    isDisabled={networkDisabled}
                    isInvalid={Boolean(error)}
                  />
                </div>
                {error && <FieldError>{error.message}</FieldError>}
              </>
            )}
          />

          <Flex flex={1} />

          <Flex gap={1} flex={1}>
            <Button w={"full"} onClick={onCancel}>
              Cancel
            </Button>
            <Button
              w={"full"}
              colorScheme="primary"
              type="submit"
              isDisabled={disableSubmit}
            >
              Save
            </Button>
          </Flex>
        </CellStack>
      </VStack>
    </NavigationContainer>
  )
}
