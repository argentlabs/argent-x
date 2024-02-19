import { Call } from "starknet"

import { getMulticallForNetwork } from "../../multicall"
import { networkService } from "../../network/service"
import { BaseWalletAccount } from "../../wallet.model"
import { multicallWithCairo0Fallback } from "./multicallWithCairo0Fallback"

/**
 * Get owner public key of account
 */

export const getOwnerForAccount = async (
  account: BaseWalletAccount,
): Promise<string | undefined> => {
  const network = await networkService.getById(account.networkId)
  const call: Call = {
    contractAddress: account.address,
    entrypoint: "get_owner",
  }
  const multicall = getMulticallForNetwork(network)
  const response = await multicallWithCairo0Fallback(call, multicall)

  return response.result[0]
}
