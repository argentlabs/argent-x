import { getChainIdFromNetworkId } from "@argent/x-shared"
import { Call, starknetId } from "starknet"
import useSWR from "swr"

import { getMulticallForNetwork } from "../../shared/multicall"
import { networkService } from "../../shared/network/service"
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
    {
      revalidateOnMount: true,
      dedupingInterval: 1000 * 60 * 60 * 1,
    },
  )
}

export async function getStarknetId(account: BaseWalletAccount) {
  try {
    const network = await networkService.getById(account.networkId)
    const chainId = getChainIdFromNetworkId(network.id)

    const multicall = getMulticallForNetwork(network)

    const starknetIdContractAddress = starknetId.getStarknetIdContract(chainId)

    const hint: string[] = []

    const call: Call = {
      contractAddress: starknetIdContractAddress,
      entrypoint: "address_to_domain",
      calldata: [account.address, hint],
    }

    const response = await multicall.callContract(call)

    const decimalDomain = response.map((element) => BigInt(element)).slice(1)

    const stringDomain = starknetId.useDecoded(decimalDomain)

    if (!stringDomain) {
      throw Error("Starkname not found")
    }

    return stringDomain
  } catch (e) {
    console.log(e)
  }
}
