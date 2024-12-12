import type { Call } from "starknet"
import { constants, num } from "starknet"

import { getMulticallForNetwork } from "../../multicall"
import { networkService } from "../../network/service"
import type { BaseWalletAccount } from "../../wallet.model"
import { multicallWithCairo0Fallback } from "./multicallWithCairo0Fallback"

export const getGuardianForAccount = async (
  account: BaseWalletAccount,
): Promise<string | undefined> => {
  const network = await networkService.getById(account.networkId)
  const call: Call = {
    contractAddress: account.address,
    entrypoint: "get_guardian",
  }
  const multicall = getMulticallForNetwork(network)
  const response = await multicallWithCairo0Fallback(call, multicall)
  return num.toHex(response[0]) === num.toHex(constants.ZERO)
    ? undefined
    : response[0]
}
