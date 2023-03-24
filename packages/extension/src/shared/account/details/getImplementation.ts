import { Call, number } from "starknet"

import { getMulticallForNetwork } from "../../multicall"
import { getNetwork } from "../../network"
import { BaseWalletAccount } from "../../wallet.model"
import { uint256ToHexString } from "./util"

/**
 * Get implementation class hash of account
 */

export const getImplementationForAccount = async (
  account: BaseWalletAccount,
) => {
  const network = await getNetwork(account.networkId)
  const call: Call = {
    contractAddress: account.address,
    entrypoint: "get_implementation",
  }
  const multicall = getMulticallForNetwork(network)
  const response = await multicall.call(call)
  return uint256ToHexString(response)
}

/**
 * Returns true if implementation class hash of account is included in the account network `accountClassHash`
 */

export const getIsCurrentImplementation = async (
  account: BaseWalletAccount,
) => {
  const network = await getNetwork(account.networkId)
  const currentImplementations = Object.values(network.accountClassHash || {})
  const accountImplementation = await getImplementationForAccount(account)
  const isCurrentImplementation = currentImplementations.some(
    (currentImplementation) =>
      number.toBN(currentImplementation).eq(number.toBN(accountImplementation)),
  )
  return isCurrentImplementation
}
