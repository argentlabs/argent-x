import {
  isEqualAddress,
  isEqualStarknetDomainName,
  isStarknetDomainName,
} from "@argent/x-shared"

import type { IAccountRepo } from "../account/store"
import type { IAddressBookRepo } from "../addressBook/store"
import type { IAddressService } from "./IAddressService"

export class AddressService implements IAddressService {
  constructor(
    private readonly accountRepo: IAccountRepo,
    private readonly addressBookRepo: IAddressBookRepo,
  ) {}

  getAddressName = async ({
    address,
    networkId,
  }: {
    address?: string
    networkId?: string
  }) => {
    const { contact, account } = await this.getAccountOrContact({
      address,
      networkId,
    })
    return contact?.name || account?.name
  }

  getAccountOrContact = async ({
    address,
    networkId,
  }: {
    address?: string
    networkId?: string
  }) => {
    const isStarknetDomainNameAddress = isStarknetDomainName(address)
    const contacts = await this.addressBookRepo.get(
      (contact) => contact.networkId === networkId,
    )

    const contact = contacts.find((contact) => {
      if (isStarknetDomainNameAddress) {
        return isEqualStarknetDomainName(address, contact.address)
      }
      return isEqualAddress(contact.address, address)
    })

    const [account] = await this.accountRepo.get(
      (account) =>
        Boolean(account.hidden) === false &&
        account.networkId === networkId &&
        isEqualAddress(account.address, address),
    )

    return {
      contact,
      account,
    }
  }
}
