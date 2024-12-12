import {
  BarAddButton,
  BarBackButton,
  CellStack,
  Empty,
  EmptyButton,
  icons,
  Input,
  NavigationContainer,
} from "@argent/x-ui"
import { InputGroup, InputLeftElement } from "@chakra-ui/react"
import type { FC } from "react"
import { useCallback, useMemo } from "react"
import { useForm } from "react-hook-form"

import type { AddressBookContact } from "../../../../shared/addressBook/type"
import type { Network } from "../../../../shared/network"
import { useAutoFocusInputRef } from "../../../hooks/useAutoFocusInputRef"
import { AccountListItem } from "../../accounts/AccountListItem"

const { SearchPrimaryIcon, PlusSecondaryIcon, AddressBookIcon } = icons

interface AddressBookSettingsScreenProps {
  contacts: AddressBookContact[]
  networks: Network[]
  onAddContact: () => void
  onContactClick: (contact: AddressBookContact) => void
}

export const AddressBookSettingsScreen: FC<AddressBookSettingsScreenProps> = ({
  contacts = [],
  networks = [],
  onAddContact,
  onContactClick,
}) => {
  const { register, watch } = useForm({
    defaultValues: { query: "" },
  })

  const networkNameFromNetworkId = useCallback(
    (networkId: string) => {
      return networks.find((network) => network.id === networkId)?.name
    },
    [networks],
  )

  const currentQueryValue = watch().query

  const filteredContacts = useMemo(() => {
    if (!currentQueryValue) {
      return contacts
    }

    return contacts.filter(({ name, address, networkId }) => {
      const networkName = networkNameFromNetworkId(networkId)

      const query = currentQueryValue.toLowerCase()

      return (
        name.toLowerCase().includes(query) ||
        address.toLowerCase().includes(query) ||
        networkName?.toLowerCase().includes(query)
      )
    })
  }, [contacts, currentQueryValue, networkNameFromNetworkId])

  const { ref, ...rest } = register("query")
  const inputRef = useAutoFocusInputRef<HTMLInputElement>()

  const hasContacts = Boolean(contacts.length)
  const hasFilteredContacts = Boolean(filteredContacts.length)

  const content = useMemo(() => {
    if (!hasContacts) {
      return (
        <Empty icon={<AddressBookIcon />} title={`No saved contacts`}>
          <EmptyButton
            mt={8}
            leftIcon={<PlusSecondaryIcon />}
            onClick={onAddContact}
          >
            New contact
          </EmptyButton>
        </Empty>
      )
    }

    return (
      <CellStack pt="0" flex={1}>
        <InputGroup size="sm">
          <InputLeftElement pointerEvents="none">
            <SearchPrimaryIcon />
          </InputLeftElement>
          <Input
            ref={(e) => {
              ref(e)
              inputRef.current = e
            }}
            {...rest}
            autoComplete="off"
            placeholder="Search by name, address or network"
            type="text"
          />
        </InputGroup>
        {!hasFilteredContacts && (
          <Empty icon={<SearchPrimaryIcon />} title={`No matching contacts`} />
        )}
        {filteredContacts.map((contact) => {
          const networkName = networkNameFromNetworkId(contact.networkId)
          return (
            <AccountListItem
              key={contact.id}
              accountId={contact.id}
              avatarSize={9}
              accountAddress={contact.address}
              networkId={contact.networkId}
              accountName={contact.name}
              networkName={networkName}
              onClick={() => onContactClick(contact)}
            />
          )
        })}
      </CellStack>
    )
  }, [
    filteredContacts,
    hasContacts,
    hasFilteredContacts,
    inputRef,
    networkNameFromNetworkId,
    onAddContact,
    onContactClick,
    ref,
    rest,
  ])

  return (
    <NavigationContainer
      leftButton={<BarBackButton />}
      rightButton={<BarAddButton onClick={onAddContact} />}
      title={"Address book"}
    >
      {content}
    </NavigationContainer>
  )
}
