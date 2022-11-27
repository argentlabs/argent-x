import { utils } from "ethers"
import { number, uint256 } from "starknet"

import { multicallProvider } from "../provider"
import tokens from "./default-tokens.json"

export interface Token {
  address: string
  name: string
  symbol: string
  decimals: number
  image?: string
}

export interface TokenWithBalance extends Token {
  balance: bigint
}

export const getTokenBalance = async (
  tokenAddress: string,
  address: string,
): Promise<TokenWithBalance> => {
  const token = tokens.find((t) => t.address === tokenAddress)
  if (!token) {
    throw new Error(`Token not found: ${tokenAddress}`)
  }
  const result = await multicallProvider.call({
    contractAddress: tokenAddress,
    entrypoint: "balanceOf",
    calldata: [address],
  })
  const balance = BigInt(
    number.toHex(
      uint256.uint256ToBN({
        low: result[0],
        high: result[1],
      }),
    ),
  )
  return {
    ...token,
    balance,
  }
}

export const getTokens = async (): Promise<Token[]> => {
  return tokens
}

export const getFeeToken = async (): Promise<Token> => {
  const tokens = await getTokens()
  return tokens.find((t) => t.symbol === "ETH")!
}

const formatTokenBalanceToCharLength =
  (length: number) =>
  (balance: bigint = 0n, decimals = 18): string => {
    const balanceFullString = utils.formatUnits(balance.toString(), decimals)

    // show max ${length} characters or what's needed to show everything before the decimal point.
    let balanceString = balanceFullString.slice(
      0,
      Math.max(length, balanceFullString.indexOf(".")),
    )

    // make sure seperator is not the last character, if so remove it
    // remove unnecessary 0s from the end, except for ".0"
    let cleanedBalanceString = balanceString
      .replace(/\.$/, "")
      .replace(/0+$/, "")
    if (cleanedBalanceString.endsWith(".")) {
      cleanedBalanceString += "0"
    }

    return cleanedBalanceString
  }

export const formatTokenAmount = formatTokenBalanceToCharLength(14)

export const formatFeeTokenAmount = (amount: bigint): string => {
  return formatTokenAmount(amount, 18)
}
