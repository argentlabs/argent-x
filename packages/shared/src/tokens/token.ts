export interface Token {
  address: string
  name: string
  symbol: string
  decimals: number
  networkId: string
  image?: string
}

export interface TokenWithBalance extends Token {
  balance: bigint
}
