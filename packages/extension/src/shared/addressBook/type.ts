export interface AddressBookContact {
  id: string
  name: string
  networkId: string
  address: string
}

export type AddressBookContactNoId = Omit<AddressBookContact, "id">
