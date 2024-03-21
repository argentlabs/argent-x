import type { Address } from "@argent/x-shared"
// just using types here
// eslint-disable-next-line @argent/local/code-import-patterns
import { logos } from "@argent/x-ui"

import { defaultNftMarketplaces } from "./defaultNftMarketplaces"

export type NftMarketplaceKey = keyof typeof defaultNftMarketplaces

export interface NftMarketplace {
  title: string
  logo?: keyof typeof logos
  url: Record<string, (contractAddress: Address, tokenId: string) => string>
}

export type NftMarketplaces = Record<string, NftMarketplace>
