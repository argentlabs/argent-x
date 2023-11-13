import { MinimalProviderInterface } from "@argent/x-multicall"
import { num } from "starknet"

import { isStarknetId } from "./starknetId"

import { Call, constants, starknetId } from "starknet"
import { addressSchema, isValidAddress, normalizeAddress } from "./address"
import { getChainIdFromNetworkId } from "./network"
import { AddressError } from "../../errors/address"
import { NetworkError } from "../../errors/network"
import { callSchema } from "../../utils/starknet"
import { CallError } from "../../errors/call"

export async function getAddressFromStarkName(
  starkName: string,
  networkId?: string,
  multicall?: MinimalProviderInterface,
) {
  if (!networkId || !multicall) {
    throw new NetworkError({
      code: "NO_NETWORK_OR_MULTICALL",
    })
  }

  const chainId = getChainIdFromNetworkId(networkId)
  const starknetIdContractAddress = starknetId.getStarknetIdContract(chainId)
  const sanitisedStarkName = starkName.replace(".stark", "")

  let call: Call | null = null
  try {
    call = callSchema.parse({
      contractAddress: starknetIdContractAddress,
      entrypoint: "domain_to_address",
      calldata: {
        domain: sanitisedStarkName
          .split(".")
          .map((element) => starknetId.useEncoded(element).toString(10)),
      },
    })
  } catch (error) {
    throw new CallError({
      code: "NOT_VALID",
      options: { error },
    })
  }

  let response, starkNameAddress
  try {
    response = await multicall.callContract(call)
    starkNameAddress = response.result[0]
  } catch (error) {
    throw new AddressError({
      code: "NO_ADDRESS_FROM_STARKNAME",
    })
  }

  const isZero = num.toBigInt(starkNameAddress) === constants.ZERO
  if (isZero) {
    /** service returned but not found */
    throw new AddressError({
      code: "STARKNAME_NOT_FOUND",
      message: `${starkName} not found`,
    })
  }

  const isValid = isValidAddress(starkNameAddress)
  if (!isValid) {
    /** service returned but not a valid address */
    throw new AddressError({
      code: "STARKNAME_INVALID_ADDRESS",
      message: `${starkName} resolved to an invalid address (${starkNameAddress})`,
    })
  }

  return normalizeAddress(starkNameAddress)
}
interface ParseAddressProps {
  address: string
  networkId?: string
  multicallProvider?: MinimalProviderInterface
}

export const parseAddress = async ({
  address,
  networkId,
  multicallProvider,
}: ParseAddressProps) => {
  let parsedAddress = null
  try {
    parsedAddress = addressSchema.parse(address)
  } catch (e) {
    if (isStarknetId(address)) {
      parsedAddress = await getAddressFromStarkName(
        address,
        networkId,
        multicallProvider,
      )
    } else {
      throw new AddressError({ code: "NOT_VALID" })
    }
  }
  return parsedAddress
}
