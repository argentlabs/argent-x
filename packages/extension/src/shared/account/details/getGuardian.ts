import { Call, constants, num } from "starknet"

import { getMulticallForNetwork } from "../../multicall"
import { networkService } from "../../network/service"
import { BaseWalletAccount } from "../../wallet.model"

/**
 * Get guardian address of account, or undefined if getGuardian returns `0x0` or account is not current implementation
 */

export const getGuardianForAccount = async (
  account: BaseWalletAccount,
): Promise<string | undefined> => {
  const network = await networkService.getById(account.networkId)
  // Prioritize Cairo 1 get_guardian over cairo 0 get_guardian
  const call: Call = {
    contractAddress: account.address,
    entrypoint: "get_guardian",
  }
  const multicall = getMulticallForNetwork(network)
  let response: { result: string[] } = { result: [] }

  try {
    response = await multicall.callContract(call)
  } catch {
    call.entrypoint = "getGuardian"
    response = await multicall.callContract(call)
  }
  // if guardian is 0, return undefined
  return num.toHex(response.result[0]) === num.toHex(constants.ZERO)
    ? undefined
    : response.result[0]
}
