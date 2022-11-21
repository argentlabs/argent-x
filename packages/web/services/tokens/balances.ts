import { utils } from "ethers"
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

export const formatTokenAmount = formatTokenBalanceToCharLength(9)

export const formatFeeTokenAmount = (amount: bigint): string => {
  return formatTokenAmount(amount, getFeeToken().decimals)
}
