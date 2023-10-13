import { Address } from "../chains"

export interface Token {
  address: Address
  name: string
  symbol: string
  decimals: number
  networkId: string
  image?: string
}

export interface TokenWithBalance extends Token {
  balance: bigint
}

export interface TokenPrice extends Token {
  amount: bigint
}
