import type { AddressBookContact } from "../addressBook/type"
import type { WalletAccount } from "../wallet.model"

export interface IAddressService {
  getAddressName({
    address,
    networkId,
  }: {
    address?: string
    networkId?: string
  }): Promise<string | undefined>
  getAccountOrContact({
    address,
    networkId,
  }: {
    address?: string
    networkId?: string
  }): Promise<{
    contact: AddressBookContact | undefined
    account: WalletAccount | undefined
  }>
}
