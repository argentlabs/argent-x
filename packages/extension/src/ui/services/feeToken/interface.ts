export interface IFeeTokenService {
  preferFeeToken(tokenAddress: string): Promise<void>
}
