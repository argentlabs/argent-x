import { Call, constants, num, starknetId } from "starknet"
import useSWR from "swr"

import { getMulticallForNetwork } from "../../shared/multicall"
import { networkService } from "../../shared/network/service"
import { getChainIdFromNetworkId } from "../../shared/network/utils"
import { BaseWalletAccount } from "../../shared/wallet.model"
import { getAccountIdentifier } from "../../shared/wallet.service"
import { isValidAddress, normalizeAddress } from "@argent/shared"

export function useStarknetId(account?: BaseWalletAccount) {
  return useSWR(
    [account && getAccountIdentifier(account), "starknetId"],
    () => {
      if (!account) {
        return
      }
      return getStarknetId(account)
    },
  )
}

export async function getStarknetId(account: BaseWalletAccount) {
  const network = await networkService.getById(account.networkId)
  const chainId = getChainIdFromNetworkId(network.id)

  const multicall = getMulticallForNetwork(network)

  const starknetIdContractAddress = starknetId.getStarknetIdContract(chainId)

  const call: Call = {
    contractAddress: starknetIdContractAddress,
    entrypoint: "address_to_domain",
    calldata: [account.address],
  }

  const response = await multicall.callContract(call)

  const decimalDomain = response.result
    .map((element) => BigInt(element))
    .slice(1)

  const stringDomain = starknetId.useDecoded(decimalDomain)

  if (!stringDomain) {
    throw Error("Starkname not found")
  }

  return stringDomain
}

export async function getAddressFromStarkName(
  starkName: string,
  networkId: string,
) {
  const network = await networkService.getById(networkId)
  const chainId = getChainIdFromNetworkId(network.id)

  const multicall = getMulticallForNetwork(network)

  const starknetIdContractAddress = starknetId.getStarknetIdContract(chainId)

  const sanitisedStarkName = starkName.replace(".stark", "")

  const call: Call = {
    contractAddress: starknetIdContractAddress,
    entrypoint: "domain_to_address",
    calldata: {
      domain: sanitisedStarkName
        .split(".")
        .map((element) => starknetId.useEncoded(element).toString(10)),
    },
  }

  let response, starkNameAddress
  try {
    response = await multicall.callContract(call)
    starkNameAddress = response.result[0]
  } catch (error) {
    throw Error("Could not get address from stark name")
  }

  const isZero = num.toBigInt(starkNameAddress) === constants.ZERO
  if (isZero) {
    /** service returned but not found */
    throw new Error(`${starkName} not found`)
  }

  const isValid = isValidAddress(starkNameAddress)
  if (!isValid) {
    /** service returned but not a valid address */
    throw new Error(
      `${starkName} resolved to an invalid address (${starkNameAddress})`,
    )
  }

  return normalizeAddress(starkNameAddress)
}
