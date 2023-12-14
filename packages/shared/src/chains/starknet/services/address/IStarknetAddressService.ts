import { MinimalProviderInterface } from "@argent/x-multicall"
import type { Address, AddressOrDomain, StarknetDomainName } from "../.."

export interface IStarknetAddressService {
  parseAddressOrDomain(
    addressOrDomain: AddressOrDomain,
    networkId: string,
    multicall: MinimalProviderInterface,
  ): Promise<Address>
  getAddressFromDomainName(
    domain: StarknetDomainName,
    networkId: string,
    multicall: MinimalProviderInterface,
  ): Promise<Address>
}
