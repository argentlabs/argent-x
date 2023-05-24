import { Multicall } from "@argent/x-multicall"
import { number, uint256 } from "starknet"

import tokens from "../assets/tokens.json"
import { Token, TokenWithBalance } from "./token"

export const getTokensBalances = async (
  networkId: string,
  multicallProvider: Multicall,
  address: string,
): Promise<TokenWithBalance[]> => {
  const filtered = tokens.filter((token) => token.networkId === networkId)

  const res = await Promise.allSettled(
    filtered.map((token) =>
      multicallProvider.call({
        contractAddress: token.address,
        entrypoint: "balanceOf",
        calldata: [address],
      }),
    ),
  )

  return res.reduce((accumulator, r, i) => {
    if (
      r.status === "rejected" ||
      (r.value[0] === "0x0" && r.value[1] === "0x0")
    ) {
      return accumulator
    }

    const balance = BigInt(
      number.toHex(
        uint256.uint256ToBN({
          low: r.value[0],
          high: r.value[1],
        }),
      ),
    )

    const newItem: TokenWithBalance = {
      ...filtered[i],
      balance,
    }

    accumulator.push(newItem)

    return accumulator
  }, [] as TokenWithBalance[])
}

export const getTokens = async (): Promise<Token[]> => {
  return tokens
}

export const getFeeToken = async (): Promise<Token | null> => {
  return tokens.find((t) => t.symbol === "ETH") || null
}

export const useToken = ({
  address,
  networkId,
}: {
  address: string
  networkId: string
}) => {
  return tokens.find(
    (token) => token.address === address && token.networkId === networkId,
  )
}
