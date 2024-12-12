import { nanoid } from "nanoid"
import { z } from "zod"

import {
  addressBookContactNoIdSchema,
  addressBookContactSchema,
} from "../schema"
import type { IAddressBookRepo } from "../store"
import { compareAddressBookContacts } from "../store"
import type { AddressBookContact, AddressBookContactNoId } from "../type"
import type { IAddressBookService } from "./IAddressBookService"
import { AddressBookError } from "../../errors/addressBook"

export class AddressBookService implements IAddressBookService {
  constructor(private readonly addressBookRepo: IAddressBookRepo) {}

  async getAll(contact?: AddressBookContact) {
    if (!contact) {
      return this.addressBookRepo.get()
    }
    addressBookContactSchema.parse(contact)
    return this.addressBookRepo.get((c) =>
      compareAddressBookContacts(c, contact),
    )
  }

  async get(contact: AddressBookContact) {
    addressBookContactSchema.parse(contact)
    const contacts = await this.getAll(contact)
    if (!contacts.length) {
      throw new AddressBookError({
        code: "GET_CONTACT_FAILED",
      })
    }
    return contacts[0]
  }

  async add(contact: AddressBookContactNoId | AddressBookContact) {
    z.union([addressBookContactNoIdSchema, addressBookContactSchema]).parse(
      contact,
    )
    const contactWithId: AddressBookContact =
      "id" in contact
        ? contact
        : {
            ...contact,
            id: nanoid(),
          }
    const success = await this.addressBookRepo.upsert(contactWithId)
    if (success) {
      return this.get(contactWithId)
    }
    throw new AddressBookError({
      code: "ADD_CONTACT_FAILED",
    })
  }

  async update(contact: AddressBookContact) {
    addressBookContactSchema.parse(contact)
    const success = await this.addressBookRepo.upsert(contact)
    if (success) {
      return this.get(contact)
    }
    throw new AddressBookError({
      code: "UPDATE_CONTACT_FAILED",
    })
  }

  async remove(contact: AddressBookContact) {
    addressBookContactSchema.parse(contact)
    const contacts = await this.addressBookRepo.remove(contact)
    if (!contacts.length) {
      throw new AddressBookError({
        code: "REMOVE_CONTACT_FAILED",
      })
    }
    return contact
  }

  async search(text: string) {
    const textLower = text.toLowerCase()
    return this.addressBookRepo.get((c) => {
      return (
        c.address.toLowerCase().includes(textLower) ||
        c.name.toLowerCase().includes(textLower)
      )
    })
  }
}
