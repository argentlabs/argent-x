import { z } from "zod"

import {
  addressBookContactNoIdSchema,
  addressBookContactSchema,
} from "./schema"

export type AddressBookContact = z.infer<typeof addressBookContactSchema>

export type AddressBookContactNoId = z.infer<
  typeof addressBookContactNoIdSchema
>

export const isAddressBookContact = (
  contact?: AddressBookContactNoId | AddressBookContact,
): contact is AddressBookContact => {
  return Boolean(contact && "id" in contact)
}
