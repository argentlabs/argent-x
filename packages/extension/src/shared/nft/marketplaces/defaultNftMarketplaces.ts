import type { Address } from "@argent/x-shared"
import type { NftMarketplaces } from "./types"

export const defaultNftMarketplaces: NftMarketplaces = {
  unframed: {
    title: "Unframed",
    logo: "UnframedLogo",
    url: {
      "mainnet-alpha": (contractAddress: Address, tokenId: string) =>
        `https://unframed.co/item/${contractAddress}/${tokenId}`,
    },
  },
  flex: {
    title: "Flex",
    logo: "FlexLogo",
    url: {
      "mainnet-alpha": (contractAddress: Address, tokenId: string) =>
        `https://hyperflex.market/starknet/asset/${contractAddress}/${tokenId}`,
    },
  },
  pyramid: {
    title: "Pyramid",
    logo: "PyramidLogo",
    url: {
      "mainnet-alpha": (contractAddress: Address, tokenId: string) =>
        `https://pyramid.market/asset/${contractAddress}/${tokenId}`,
    },
  },
  element: {
    title: "Element",
    logo: "ElementLogo",
    url: {
      "mainnet-alpha": (contractAddress: Address, tokenId: string) =>
        `https://element.market/assets/starknet/${contractAddress}/${tokenId}`,
    },
  },
} as const
