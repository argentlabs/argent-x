import { Call, number } from "starknet"

import { getMulticallForNetwork } from "../../multicall"
import { getNetwork, getProvider } from "../../network"
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
  if (network.multicallAddress) {
    const multicall = getMulticallForNetwork(network)
    const response = await multicall.call(call)
    return uint256ToHexString(response)
  }
  /** fallback to single call */
  const provider = getProvider(network)
  const response = await provider.callContract(call)
  return uint256ToHexString(response.result)
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
