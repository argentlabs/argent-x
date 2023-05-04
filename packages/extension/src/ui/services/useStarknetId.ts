import { Call, stark } from "starknet"
import { starknetId } from "starknet5"
import useSWR from "swr"

import { getMulticallForNetwork } from "../../shared/multicall"
import { getNetwork } from "../../shared/network"
import { getChainIdFromNetworkId } from "../../shared/network/utils"
import { BaseWalletAccount } from "../../shared/wallet.model"
import { getAccountIdentifier } from "../../shared/wallet.service"

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
  const network = await getNetwork(account.networkId)
  const chainId = getChainIdFromNetworkId(network.id)

  const multicall = getMulticallForNetwork(network)

  const starknetIdContractAddress = starknetId.getStarknetIdContract(chainId)

  const call: Call = {
    contractAddress: starknetIdContractAddress,
    entrypoint: "address_to_domain",
    calldata: [account.address],
  }

  const response = await multicall.call(call)

  const decimalDomain = response.map((element) => BigInt(element)).slice(1)

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
  const network = await getNetwork(networkId)
  const chainId = getChainIdFromNetworkId(network.id)

  const multicall = getMulticallForNetwork(network)

  const starknetIdContractAddress = starknetId.getStarknetIdContract(chainId)

  const call: Call = {
    contractAddress: starknetIdContractAddress,
    entrypoint: "domain_to_address",
    calldata: stark.compileCalldata({
      domain: [
        starknetId.useEncoded(starkName.replace(".stark", "")).toString(10),
      ],
    }),
  }

  try {
    const response = await multicall.call(call)
    return response[0]
  } catch (error) {
    throw Error("Could not get address from stark name")
  }
}
