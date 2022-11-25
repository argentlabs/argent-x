import { Call, constants, number, uint256 } from "starknet"

import { getMulticallForNetwork } from "../../multicall"
import { getNetwork, getProvider } from "../../network"
import { BaseWalletAccount } from "../../wallet.model"
import { getIsCurrentImplementation } from "./getImplementation"

/**
 * Get guardian address of account, or undefined if getGuardian returns `0x0` or account is not current implementation (deprecated?)
 */

export const getGuardianForAccount = async (
  account: BaseWalletAccount,
): Promise<string | undefined> => {
  /**
   * Skip older implementations which may use 'get_guardian' - if there are many old accounts
   * then multicall will eventually (after 3 errors?) be throttled by Chrome leading to complete failure
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
  if (guardian.eq(constants.ZERO)) {
    return
  }
  return number.toHexString(guardian)
}
