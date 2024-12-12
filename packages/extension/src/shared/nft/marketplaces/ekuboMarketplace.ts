import type { Address, NftItem } from "@argent/x-shared"
import { isEqualAddress } from "@argent/x-shared"
import { constants } from "starknet"
import { z } from "zod"

import type { NftMarketplace } from "./types"

export const ekuboNftContract: Address = `0x07b696af58c967c1b14c9dde0ace001720635a660a8e90c565ea459345318b30`
export const ekuboPositionsContract: Address = `0x02e0af29598b407c8716b17f6d2795eca1b471413fa03fb145a5e33722184067`

export const ekuboMarketplace: NftMarketplace = {
  title: "Ekubo",
  url: {
    /** TODO: looks like should always use ekuboPositionsContract instead of the nft _contractAddress */
    "mainnet-alpha": (_contractAddress: Address, tokenId: string) =>
      `https://app.ekubo.org/positions/${constants.StarknetChainId.SN_MAIN}/${ekuboPositionsContract}/${tokenId}`,
  },
} as const

const ekuboNftSchema = z.object({
  contract_address: z.string().refine((value) => {
    return isEqualAddress(value, ekuboNftContract)
  }),
})

export function isEkuboNft(nft?: Partial<NftItem> | null) {
  return ekuboNftSchema.safeParse(nft).success
}
