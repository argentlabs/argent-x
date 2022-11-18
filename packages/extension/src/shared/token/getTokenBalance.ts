import { Abi, Contract, uint256 } from "starknet"

import parsedErc20Abi from "../../abis/ERC20.json"
import { getMulticallForNetwork } from "../multicall/getMulticall"
import { getNetwork, getProvider } from "../network"
import { BaseWalletAccount } from "../wallet.model"

/**
 * Get balance of token at account address on network.
 * Uses Multicall if `multicallAddress` is set on the network,
 * or falls back to single call on the token contract.
 */

export const getTokenBalanceForAccount = async (
  tokenAddress: string,
  account: BaseWalletAccount,
): Promise<string> => {
  const network = await getNetwork(account.networkId)
  if (network.multicallAddress) {
    const multicall = getMulticallForNetwork(network)
    const response = await multicall.call({
      contractAddress: tokenAddress,
      entrypoint: "balanceOf",
      calldata: [account.address],
    })
    const [low, high] = response
    const balance = uint256.uint256ToBN({ low, high }).toString()
    return balance
  }
  /** fallback to single call */
  const provider = getProvider(network)
  const tokenContract = new Contract(
    parsedErc20Abi as Abi,
    tokenAddress,
    provider,
  )
  const result = await tokenContract.balanceOf(account.address)
  const balance = uint256.uint256ToBN(result.balance).toString()
  return balance
}
