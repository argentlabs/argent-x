import { addressBookRepo } from "../store"
import { AddressBookService } from "./implementation"

export const addressBookService = new AddressBookService(addressBookRepo)
