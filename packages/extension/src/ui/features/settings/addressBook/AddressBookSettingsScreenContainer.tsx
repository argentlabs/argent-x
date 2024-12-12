import type { FC } from "react"
import { useCallback } from "react"
import { useNavigate } from "react-router-dom"

import type { AddressBookContact } from "../../../../shared/addressBook/type"
import { routes } from "../../../../shared/ui/routes"
import { allAddressBookContactsView } from "../../../views/addressBook"
import { useView } from "../../../views/implementation/react"
import { allNetworksView } from "../../../views/network"
import { AddressBookSettingsScreen } from "./AddressBookSettingsScreen"

export const AddressBookSettingsScreenContainer: FC = () => {
  const navigate = useNavigate()
  const contacts = useView(allAddressBookContactsView)
  const networks = useView(allNetworksView)
  const onContactClick = useCallback(
    (contact: AddressBookContact) => {
      navigate(routes.settingsAddressBookAddOrEdit(contact))
    },
    [navigate],
  )

  const onAddContact = useCallback(() => {
    navigate(routes.settingsAddressBookAddOrEdit())
  }, [navigate])
  return (
    <AddressBookSettingsScreen
      contacts={contacts}
      networks={networks}
      onAddContact={onAddContact}
      onContactClick={onContactClick}
    />
  )
}
