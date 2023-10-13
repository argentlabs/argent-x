import { Address } from "@argent/shared"

export interface TokenView {
  address: Address
  name: string
  symbol: string
  decimals: number
  balance: string

  iconUrl?: string
  showAlways?: boolean
}
