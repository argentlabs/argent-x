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

export const getFeeToken = (): Token => {
  return tokens.find((token) => token.symbol === "ETH")!
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

export const formatTokenAmount = (amount: bigint, decimals: number): string => {
  const formattedAmount = amount.toString()
  const decimalsIndex = formattedAmount.length - decimals
  if (decimalsIndex <= 0) {
    return `0.${"0".repeat(-decimalsIndex)}${formattedAmount}`
  }
  return `${formattedAmount.slice(0, decimalsIndex)}.${formattedAmount.slice(
    decimalsIndex,
  )}`
}

export const formatFeeTokenAmount = (amount: bigint): string => {
  return formatTokenAmount(amount, getFeeToken().decimals)
}
