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

export const equalToken = (
  a: Pick<RequestToken, "address" | "networkId">,
  b: Pick<RequestToken, "address" | "networkId">,
) => a.address === b.address && a.networkId === b.networkId

export const parsedDefaultTokens: Token[] = defaultTokens.map((token) => ({
  ...token,
  networkId: token.network,
}))

export const testDappToken = (networkId: string) =>
  defaultTokens.find(
    ({ name, network }) => name === "Test Token" && network === networkId,
  )

export const feeToken = (networkId: string) =>
  defaultTokens.find(
    ({ symbol, network }) => symbol === "ETH" && network === networkId,
  )
