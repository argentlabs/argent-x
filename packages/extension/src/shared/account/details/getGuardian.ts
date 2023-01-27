import { Call, constants, number, uint256 } from "starknet"

import { getMulticallForNetwork } from "../../multicall"
import { getNetwork, getProvider } from "../../network"
import { BaseWalletAccount } from "../../wallet.model"
import { getIsCurrentImplementation } from "./getImplementation"

/**
 * Get guardian address of account, or undefined if getGuardian returns `0x0` or account is not current implementation
 */

export const getGuardianForAccount = async (
  account: BaseWalletAccount,
): Promise<string | undefined> => {
  /**
   * Skip older implementations which may use 'get_guardian'
   */
  const isCurrent = await getIsCurrentImplementation(account)
  if (!isCurrent) {
    return
  }
  const network = await getNetwork(account.networkId)
  const call: Call = {
    contractAddress: account.address,
    entrypoint: "getGuardian",
  }
  if (network.multicallAddress) {
    const multicall = getMulticallForNetwork(network)
    const response = await multicall.call(call)
    return shapeResponse(response)
  }
  /** fallback to single call */
  const provider = getProvider(network)
  const response = await provider.callContract(call)
  return shapeResponse(response.result)
}

const shapeResponse = (response: string[]) => {
  const [low, high] = response
  const guardian = uint256.uint256ToBN({ low, high })
  if (guardian === constants.ZERO) {
    return
  }
  return number.toHex(guardian)
}
