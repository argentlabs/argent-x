import { NavigationContainerProps, SelectOptions } from "@argent/x-ui"
import { isFunction } from "lodash-es"
import { FC, useMemo } from "react"
import { useNavigate } from "react-router-dom"

import {
  AddressBookContact,
  AddressBookContactNoId,
  isAddressBookContact,
} from "../../../../shared/addressBook/type"
import { useQuery } from "../../../hooks/useQuery"
import { addressBookService } from "../../../services/addressBook"
import { addressBookContactIdView } from "../../../views/addressBook"
import { useView } from "../../../views/implementation/react"
import { useCurrentNetwork } from "../../networks/hooks/useCurrentNetwork"
import { useNetworks } from "../../networks/hooks/useNetworks"
import { AddressBookAddOrEditScreen } from "./AddressBookAddOrEditScreen"

export interface AddressBookAddOrEditScreenContainerProps
  extends NavigationContainerProps {
  networkDisabled?: boolean
  addressDisabled?: boolean
  onSave?: (savedContact: AddressBookContact) => void
  onCancel?: () => void
  contact?: Partial<AddressBookContact>
}

export const AddressBookAddOrEditScreenContainer: FC<
  AddressBookAddOrEditScreenContainerProps
> = ({
  networkDisabled,
  addressDisabled,
  onSave: onSaveProp,
  onCancel: onCancelProp,
  contact: contactProp,
  ...rest
}) => {
  /** allow providing the contact props in url or prop */
  const query = useQuery()
  const id = query.get("id")

  const navigate = useNavigate()
  const currentNetwork = useCurrentNetwork()
  const currentNetworkId = currentNetwork?.id

  /** retreive an existing contact from id provided in contact prop or via url */
  const existingContact = useView(
    addressBookContactIdView(id || contactProp?.id),
  )
  /** if successful, then we are editing */
  const isEditingExistingContact = isAddressBookContact(existingContact)

  /** otherwise, create a new contact template from provided contact or url params */
  const contact = useMemo(() => {
    if (isEditingExistingContact) {
      return existingContact
    }
    const address = query.get("address") ?? contactProp?.address ?? ""
    const name = query.get("name") ?? contactProp?.name ?? ""
    const networkId =
      query.get("networkId") ?? contactProp?.networkId ?? currentNetworkId
    return {
      address,
      name,
      networkId,
    }
  }, [
    contactProp,
    currentNetworkId,
    existingContact,
    isEditingExistingContact,
    query,
  ])

  const networks = useNetworks()

  const networkOptions: SelectOptions = networks.map((network) => ({
    label: network.name,
    value: network.id,
  }))

  const onSave = async (
    updatedContact: AddressBookContactNoId | AddressBookContact,
  ) => {
    let savedContact: AddressBookContact | undefined

    if (isEditingExistingContact) {
      savedContact = await addressBookService.update({
        ...updatedContact,
        id: existingContact.id,
      })
    } else {
      savedContact = await addressBookService.add(updatedContact)
    }

    if (isFunction(onSaveProp)) {
      onSaveProp(savedContact)
    } else {
      navigate(-1)
    }
  }

  const onDelete = async () => {
    if (isEditingExistingContact) {
      await addressBookService.remove(existingContact)
    }
    navigate(-1)
  }

  const onCancel = () => {
    if (isFunction(onCancelProp)) {
      onCancelProp()
    } else {
      navigate(-1)
    }
  }

  return (
    <AddressBookAddOrEditScreen
      contact={contact}
      onSave={onSave}
      onDelete={onDelete}
      onCancel={onCancel}
      networkOptions={networkOptions}
      networkDisabled={networkDisabled}
      addressDisabled={addressDisabled}
      {...rest}
    />
  )
}
