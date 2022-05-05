import defaultTokens from "../assets/default-tokens.json"

export interface Token {
  address: string
  networkId: string
  name: string
  symbol: string
  decimals: string
  image?: string
  showAlways?: boolean
}

export type RequestToken = Partial<
  Omit<Token, "image" | "showAlways" | "address">
> &
  Pick<Token, "address">

export const equalToken = (
  a: Pick<Token, "address" | "networkId">,
  b: Pick<Token, "address" | "networkId">,
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
