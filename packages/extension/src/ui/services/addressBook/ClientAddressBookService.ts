import type { IAddressBookService } from "../../../shared/addressBook/service/IAddressBookService"
import type {
  AddressBookContact,
  AddressBookContactNoId,
} from "../../../shared/addressBook/type"
import type { messageClient } from "../trpc"

export class ClientAddressBookService implements IAddressBookService {
  constructor(private readonly trpcClient: typeof messageClient) {}

  async add(contact: AddressBookContact | AddressBookContactNoId) {
    return this.trpcClient.addressBook.add.mutate(contact)
  }

  async update(contact: AddressBookContact) {
    return this.trpcClient.addressBook.update.mutate(contact)
  }

  async remove(contact: AddressBookContact) {
    return this.trpcClient.addressBook.remove.mutate(contact)
  }
}
