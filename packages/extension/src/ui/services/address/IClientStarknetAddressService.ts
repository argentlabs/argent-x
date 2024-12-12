import type {
  Address,
  AddressOrDomain,
  StarknetDomainName,
} from "@argent/x-shared"

export interface IClientStarknetAddressService {
  parseAddressOrDomain(
    addressOrDomain: AddressOrDomain,
    networkId: string,
  ): Promise<Address>
  getAddressFromDomainName(
    domain: StarknetDomainName,
    networkId: string,
  ): Promise<Address>
}
