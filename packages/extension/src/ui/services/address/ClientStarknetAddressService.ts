import { AddressOrDomain, StarknetDomainName } from "@argent/x-shared"
import { messageClient } from "../trpc"
import { IClientStarknetAddressService } from "./IClientStarknetAddressService"

export class ClientStarknetAddressService
  implements IClientStarknetAddressService
{
  constructor(private readonly trpcClient: typeof messageClient) {}

  async getAddressFromDomainName(
    domain: StarknetDomainName,
    networkId: string,
  ) {
    return this.trpcClient.address.getAddressFromDomainName.query({
      domain,
      networkId,
    })
  }

  async parseAddressOrDomain(
    addressOrDomain: AddressOrDomain,
    networkId: string,
  ) {
    return this.trpcClient.address.parseAddressOrDomain.query({
      addressOrDomain,
      networkId,
    })
  }
}
