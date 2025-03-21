import type { Address } from "@argent/x-shared"

export interface IOnRampService {
  /** get topper argent url */
  getTopperUrl(address: Address, assetSymbol?: string): Promise<string>
}
