import { addressBookRepo } from "../store"
import { AddressBookService } from "./AddressBookService"

export const addressBookService = new AddressBookService(addressBookRepo)
