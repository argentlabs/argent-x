import type { MinimalProviderInterface } from "@argent/x-multicall"
import type { IHttpService } from "../../../../http"
import {
  isAddress,
  normalizeAddress,
  type StarknetDomainName,
} from "../../../../chains/starknet"
import { AddressError } from "../../../../errors/address"
import { isArgentName } from "../../argentName"
import { getAddressFromArgentName } from "../../getAddressFromArgentName"
import { getAddressFromStarkName } from "../../getAddressFromStarkName"
import { isStarknetId } from "../../starknetId"
import type { IStarknetAddressService } from "./IStarknetAddressService"

export type MinimalHttpService = Pick<IHttpService, "get">

export class StarknetAddressService implements IStarknetAddressService {
  constructor(
    readonly httpService: MinimalHttpService,
    readonly baseUrl: string,
    readonly allowedArgentNameNetworkId: string,
  ) {}

  async parseAddressOrDomain(
    addressOrDomain: string,
    networkId: string,
    multicall: MinimalProviderInterface,
  ) {
    if (isAddress(addressOrDomain)) {
      return normalizeAddress(addressOrDomain)
    }
    try {
      const result = await this.getAddressFromDomainName(
        addressOrDomain,
        networkId,
        multicall,
      )
      return result
    } catch (e) {
      throw new AddressError({ code: "NOT_VALID" })
    }
  }

  async getAddressFromDomainName(
    domain: StarknetDomainName,
    networkId: string,
    multicall: MinimalProviderInterface,
  ) {
    if (isStarknetId(domain)) {
      return getAddressFromStarkName(domain, networkId, multicall)
    }
    if (isArgentName(domain)) {
      if (networkId !== this.allowedArgentNameNetworkId) {
        throw new AddressError({
          code: "ARGENT_NAME_INVALID_NETWORK",
          message: `Argent name is only enabled on "${this.allowedArgentNameNetworkId}"`,
        })
      }
      return getAddressFromArgentName(domain, this.httpService, this.baseUrl)
    }
    throw new AddressError({
      code: "NO_ADDRESS_FROM_DOMAIN",
    })
  }
}
