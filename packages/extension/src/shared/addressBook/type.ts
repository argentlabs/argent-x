export interface AddressBookContactNoId {
  name: string
  networkId: string
  address: string
}

export interface AddressBookContact extends AddressBookContactNoId {
  id: string
}
