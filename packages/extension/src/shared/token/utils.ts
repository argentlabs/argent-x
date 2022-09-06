import defaultTokens from "../../assets/default-tokens.json"
import { isEqualAddress } from "../../ui/services/addresses"
import { BaseToken, Token } from "./type"

export const equalToken = (a: BaseToken, b: BaseToken) =>
  a.networkId === b.networkId && isEqualAddress(a.address, b.address)

export const parsedDefaultTokens: Token[] = defaultTokens.map((token) => ({
  ...token,
  networkId: token.network,
  decimals: parseInt(token.decimals, 10),
}))

export const testDappToken = (networkId: string) =>
  defaultTokens.find(
    ({ name, network }) => name === "Test Token" && network === networkId,
  )

export const getFeeToken = (networkId: string) =>
  parsedDefaultTokens.find(
    ({ symbol, networkId: network }) =>
      symbol === "ETH" && network === networkId,
  )
