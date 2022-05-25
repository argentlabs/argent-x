import defaultTokens from "../assets/default-tokens.json"

export interface RequestToken {
  address: string
  networkId?: string
  name?: string
  symbol?: string
  decimals?: string
}

export interface Token extends Required<RequestToken> {
  image?: string
  showAlways?: boolean
}

export type UniqueToken = Pick<RequestToken, "address" | "networkId">

export const equalToken = (a: UniqueToken, b: UniqueToken) =>
  a.address === b.address && a.networkId === b.networkId

export const parsedDefaultTokens: Token[] = defaultTokens.map((token) => ({
  ...token,
  networkId: token.network,
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
