import { number, uint256 } from "starknet"

import { multicallProvider } from "../provider"
import tokens from "./default-tokens.json"

export const getTokenBalance = async (
  tokenAddress: string,
  address: string,
) => {
  const result = await multicallProvider.call({
    contractAddress: tokenAddress,
    entrypoint: "balanceOf",
    calldata: [address],
  })
  return BigInt(
    number.toHex(
      uint256.uint256ToBN({
        low: result[0],
        high: result[1],
      }),
    ),
  )
}

interface Token {
  address: string
  name: string
  symbol: string
  decimals: number
  image?: string
}

interface TokenWithBalance extends Token {
  balance: bigint
}

export const getTokensBalances = async (
  address: string,
): Promise<TokenWithBalance[]> => {
  const balances = await Promise.all(
    tokens.map(async (token) => ({
      ...token,
      balance: await getTokenBalance(token.address, address),
    })),
  )
  return balances
}
