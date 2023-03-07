import { Call, constants, number, uint256 } from "starknet"

import { getMulticallForNetwork } from "../../multicall"
import { getNetwork } from "../../network"
import { BaseWalletAccount } from "../../wallet.model"

/**
 * Get guardian address of account, or undefined if getGuardian returns `0x0`
 */

export const getGuardianForAccount = async (
  account: BaseWalletAccount,
): Promise<string | undefined> => {
  const network = await getNetwork(account.networkId)
  const call: Call = {
    contractAddress: account.address,
    entrypoint: "getGuardian",
  }
  const multicall = getMulticallForNetwork(network)
  const response = await multicall.call(call)
  return shapeResponse(response)
}

const shapeResponse = (response: string[]) => {
  const [low, high] = response
  const guardian = uint256.uint256ToBN({ low, high })
  if (guardian.eq(constants.ZERO)) {
    return
  }
  return number.toHexString(guardian)
}
