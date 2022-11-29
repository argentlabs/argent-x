import { SupportedNetworks } from "../constants"
import { Token } from "./token"

export class LPToken extends Token {
  token0: Token
  token1: Token

  constructor(
    networkId: SupportedNetworks,
    token0: Token,
    token1: Token,
    address: string,
  ) {
    const tokens = token0.sortsBefore(token1)
      ? [token0, token1]
      : [token1, token0]

    const lpSymbol = `${tokens[0].symbol}-${tokens[1].symbol}`
    const lpName = `${tokens[0].name}/${tokens[1].name}`

    super(networkId, address, 18, lpSymbol, lpName)
    this.token0 = tokens[0]
    this.token1 = tokens[1]
  }
}
