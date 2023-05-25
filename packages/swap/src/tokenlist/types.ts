import { SupportedNetworks, Token } from "../sdk"

export interface TokenInfo {
  readonly networkId: SupportedNetworks
  readonly address: string
  readonly name: string
  readonly decimals: number
  readonly symbol: string
  readonly image?: string
}

export type TokenInfoList = TokenInfo[]

/**
 * Token instances created from token info.
 */
export class WrappedTokenInfo extends Token {
  public readonly tokenInfo: TokenInfo
  constructor(tokenInfo: TokenInfo) {
    super(
      tokenInfo.networkId,
      tokenInfo.address,
      tokenInfo.decimals,
      tokenInfo.symbol,
      tokenInfo.name,
    )
    this.tokenInfo = tokenInfo
  }
  public get image(): string | undefined {
    return this.tokenInfo.image
  }
}

export type TokenAddressMap = Readonly<{
  [networkId in SupportedNetworks]: Readonly<{
    [tokenAddress: string]: WrappedTokenInfo
  }>
}>
