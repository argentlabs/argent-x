import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

import { addressBookRepo } from "../../shared/addressBook/store"
import { atomFromRepo } from "./implementation/atomFromRepo"
import { atomWithDebugLabel } from "./atomWithDebugLabel"

/**
 * @internal use `allAddressBookContactsView` instead
 */
const allAddressBookContactsAtom = atomFromRepo(addressBookRepo)

export const allAddressBookContactsView = atom(async (get) => {
  const contacts = await get(allAddressBookContactsAtom)
  return contacts
})

export const addressBookContactIdView = atomFamily((contactId?: string) => {
  return atomWithDebugLabel(
    atom(async (get) => {
      const contacts = await get(allAddressBookContactsAtom)
      return contacts.find((c) => c.id === contactId)
    }),
    `addressBookContactIdView-${contactId}`,
  )
})

export const addressBookContactsOnNetworkView = atomFamily(
  (networkId?: string) => {
    return atomWithDebugLabel(
      atom(async (get) => {
        const contacts = await get(allAddressBookContactsAtom)
        return contacts.filter((c) => c.networkId === networkId)
      }),
      `addressBookContactsOnNetworkView-${networkId}`,
    )
  },
)
