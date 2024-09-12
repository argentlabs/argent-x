import { accountRepo } from "../account/store"
import { addressBookRepo } from "../addressBook/store"
import { AddressService } from "./AddressService"

export const addressService = new AddressService(accountRepo, addressBookRepo)
