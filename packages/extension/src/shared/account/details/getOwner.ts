import { Call } from "starknet"

import { getMulticallForNetwork } from "../../multicall"
import { networkService } from "../../network/service"
import { BaseWalletAccount } from "../../wallet.model"

/**
 * Get owner public key of account
 */

export const getOwnerForAccount = async (
  account: BaseWalletAccount,
): Promise<string | undefined> => {
  const network = await networkService.getById(account.networkId)
  // Prioritize Cairo 1 get_owner over cairo 0 getOwner
  const call: Call = {
    contractAddress: account.address,
    entrypoint: "get_owner",
  }
  const multicall = getMulticallForNetwork(network)
  let response: { result: string[] } = { result: [] }

  try {
    response = await multicall.callContract(call)
  } catch {
    call.entrypoint = "getOwner"
    response = await multicall.callContract(call)
  }
  return response.result[0]
}
