export interface BaseToken {
  address: string
  networkId: string
}

export interface RequestToken extends Omit<BaseToken, "networkId"> {
  address: string
  networkId?: string
  name?: string
  symbol?: string
  decimals?: number
}

export interface Token extends Required<RequestToken> {
  image?: string
  showAlways?: boolean
}
