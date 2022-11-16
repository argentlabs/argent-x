import { uint256 } from "starknet"
import useSWR from "swr"

import {
  NoMulticallAddressError,
  getMulticallForNetwork,
} from "../../../shared/multicall"
import { BaseToken } from "../../../shared/token/type"
import { Account } from "../accounts/Account"

export const useTokenBalanceForAccount = (
  token: BaseToken,
  account: Account,
) => {
  const key = [
    "balanceOf",
    token.address,
    token.networkId,
    account.address,
    account.network.multicallAddress,
  ]
    .filter(Boolean)
    .join("-")
  const { data, ...rest } = useSWR(
    key,
    async () => {
      // TODO: extract this fetcher into a shared async function
      const multicall = getMulticallForNetwork(account.network)
      const response = await multicall.call({
        contractAddress: token.address,
        entrypoint: "balanceOf",
        calldata: [account.address],
      })
      const [low, high] = response
      const balance = uint256.uint256ToBN({ low, high }).toString()
      return balance
    },
    {
      shouldRetryOnError: (err) => {
        if (err instanceof NoMulticallAddressError) {
          /** no use retrying if there is no multicall address */
          return false
        }
        return true
      },
    },
  )
  return {
    balance: data,
    ...rest,
  }
}
