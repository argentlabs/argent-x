import { Address, AddressOrDomain, StarknetDomainName } from "@argent/shared"

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
