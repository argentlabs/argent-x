import type { Address } from "@argent/shared"
import { logos } from "@argent/ui"
import { defaultNftMarketplaces } from "./defaultNftMarketplaces"

export type NftMarketplaceKey = keyof typeof defaultNftMarketplaces

export interface NftMarketplace {
  title: string
  logo?: keyof typeof logos
  url: Record<string, (contractAddress: Address, tokenId: string) => string>
}

export type NftMarketplaces = Record<string, NftMarketplace>
