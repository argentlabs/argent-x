import { addressSchema, isEqualAddress } from "@argent/shared"

import defaultTokens from "../../../assets/default-tokens.json"
import { BaseToken, Token } from "./type"

export const equalToken = (a: BaseToken, b: BaseToken) =>
  a.networkId === b.networkId && isEqualAddress(a.address, b.address)

export const parsedDeprecatedTokens: Token[] = defaultTokens.map((token) => ({
  ...token,
  address: addressSchema.parse(token.address),
  networkId: token.network,
  decimals: parseInt(token.decimals, 10),
  image: token.iconUrl,
}))

export const testDappToken = (networkId: string) =>
  defaultTokens.find(
    ({ name, network }) => name === "Test Token" && network === networkId,
  )

export const getFeeToken = (networkId: string) =>
  parsedDeprecatedTokens.find(
    ({ symbol, networkId: network }) =>
      symbol === "ETH" && network === networkId,
  )
