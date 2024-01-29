import { number, uint256, ProviderInterface } from "starknet"

import tokens from "../assets/tokens.json"
import { Address } from "../chains"
import { Token, TokenWithBalance } from "./token"

export const getTokensBalances = async (
  networkId: string,
  provider: Pick<ProviderInterface, "callContract">,
  address: Address,
): Promise<TokenWithBalance[]> => {
  const filtered = tokens.filter(
    (token) => token.networkId === networkId,
  ) as Token[]

  const res = await Promise.allSettled(
    filtered.map((token) =>
      provider.callContract({
        contractAddress: token.address,
        entrypoint: "balanceOf",
        calldata: [address],
      }),
    ),
  )

  return res.reduce((accumulator, r, i) => {
    if (
      r.status === "rejected" ||
      (r.value.result[0] === "0x0" && r.value.result[1] === "0x0")
    ) {
      return accumulator
    }

    const balance = BigInt(
      number.toHex(
        uint256.uint256ToBN({
          low: r.value.result[0],
          high: r.value.result[1],
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
  return tokens as Token[]
}

export const useToken = ({
  address,
  networkId,
}: {
  address: Address
  networkId: string
}): Token | undefined => {
  // TODO replace this with actual token schema
  const parsedTokens = tokens as Token[]
  return parsedTokens.find(
    (token) => token.address === address && token.networkId === networkId,
  )
}
