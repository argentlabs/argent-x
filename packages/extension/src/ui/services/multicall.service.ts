import { Abi, Contract } from "starknet"

import MULTICALL_ABI from "../../abis/Mulitcall.json"
import { Network, getProvider } from "../../shared/network"

export const getMulticallContract = (network: Network): Contract | null => {
  const multicallAddress = network.multicallAddress

  if (!multicallAddress) {
    return null
  }

  return new Contract(
    MULTICALL_ABI as Abi,
    multicallAddress,
    getProvider(network),
  )
}
