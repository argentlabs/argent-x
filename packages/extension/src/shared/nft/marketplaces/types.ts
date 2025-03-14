import type { Address } from "@argent/x-shared"

import type { defaultNftMarketplaces } from "./defaultNftMarketplaces"
import { z } from "zod"

// TODO: rename - this is really 'settings' logo keys
export const nftMarketplaceLogoKeysSchema = z.enum([
  "UnframedLogo",
  "FlexLogo",
  "PyramidLogo",
  "ElementLogo",
  "StarknetLogo",
  "VoyagerLogo",
])

export type NftMarketplaceLogoKeys = z.infer<
  typeof nftMarketplaceLogoKeysSchema
>

export type NftMarketplaceKey = keyof typeof defaultNftMarketplaces

export interface NftMarketplace {
  title: string
  logo?: NftMarketplaceLogoKeys
  url: Record<string, (contractAddress: Address, tokenId: string) => string>
}

export type NftMarketplaces = Record<string, NftMarketplace>
