import { MinimalProviderInterface } from "@argent/x-multicall"
import { Call, constants, starknetId } from "starknet"
import { AddressError } from "../../errors/address"
import { CallError } from "../../errors/call"
import { NetworkError } from "../../errors/network"
import { callSchema } from "../../utils/starknet/starknet"
import { isValidAddress, isZeroAddress, normalizeAddress } from "./address"
import { getChainIdFromNetworkId } from "./network"
import type { StarknetID } from "./starknetId"

export function starkNameToCallDataDomain(starkName: StarknetID) {
  const sanitisedStarkName = starkName.replace(".stark", "")
  const domain = sanitisedStarkName
    .split(".")
    .map((element) => starknetId.useEncoded(element).toString(10))
  return domain
}

export function getStarknetIdContractAddressFromNetworkId(networkId: string) {
  const chainId = getChainIdFromNetworkId(networkId)
  const starknetIdContractAddress = starknetId.getStarknetIdContract(chainId)
  return starknetIdContractAddress
}

export function getCallFromStarkName(starkName: StarknetID, networkId: string) {
  const contractAddress = getStarknetIdContractAddressFromNetworkId(networkId)
  const domain = starkNameToCallDataDomain(starkName)
  const useHint = networkId === "goerli-alpha"
  try {
    /** FIXME: at present time, testnet requires to pass 'hint' while mainnet does not */
    const hint: string[] = []
    const calldata = useHint ? { domain, hint } : { domain }
    const call = callSchema.parse({
      contractAddress,
      entrypoint: "domain_to_address",
      calldata,
    })
    return call
  } catch (error) {
    throw new CallError({
      code: "NOT_VALID",
      options: { error },
    })
  }
}

export async function getAddressFromStarkName(
  starkName: StarknetID,
  networkId?: string,
  multicall?: MinimalProviderInterface,
) {
  if (!networkId || !multicall) {
    throw new NetworkError({
      code: "NO_NETWORK_OR_MULTICALL",
    })
  }

  let call: Call | null = null
  try {
    call = getCallFromStarkName(starkName, networkId)
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
    /** think of this like a 500 server error */
    throw new AddressError({
      code: "STARKNAME_ERROR",
    })
  }

  if (isZeroAddress(starkNameAddress)) {
    /** think of this like a 404 not found error */
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
