import { uint256 } from "starknet"

import { getNetwork } from "../network"
import { BaseToken } from "../token/type"
import { BaseWalletAccount } from "../wallet.model"
import { getMulticallForNetwork } from "./getMulticall"

/** use Multicall to get balance of token at account address on network */

export const getTokenBalanceForWalletAccount = async (
  token: BaseToken,
  account: BaseWalletAccount,
) => {
  const network = await getNetwork(account.networkId)
  const multicall = getMulticallForNetwork(network)
  const response = await multicall.call({
    contractAddress: token.address,
    entrypoint: "balanceOf",
    calldata: [account.address],
  })
  const [low, high] = response
  const balance = uint256.uint256ToBN({ low, high }).toString()
  return balance
}
