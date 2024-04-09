import { describe, expect, test } from "vitest"
import { isEkuboNft } from "./ekuboMarketplace"
import { NftItem } from "@argent/x-shared"

const mockEkuboNft: Partial<NftItem> = {
  token_id: "231988",
  contract_address:
    "0x07b696af58c967c1b14c9dde0ace001720635a660a8e90c565ea459345318b30",
  name: "USDC / ETH : 2.94133e-27 <> 3.39982e+50 : 0.05% / 0.1%",
  spec: "ERC721",
  description: "",
  best_bid_order: {},
  properties: [
    {
      key: "tick_upper",
      value: "88722000",
    },
    {
      key: "tick_spacing",
      value: "1000",
    },
    {
      key: "fee",
      value: "170141183460469235273462165868118016",
    },
    {
      key: "minted_timestamp",
      value: "1700752523000",
    },
    {
      key: "token0",
      value:
        "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    },
    {
      key: "extension",
      value: "0x0",
    },
    {
      key: "token1",
      value:
        "0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
    },
    {
      key: "minted_tx_hash",
      value:
        "0x2ec59356e2cbe50ea9024d7fd2c7f9295c715091b3fa50b275adfd1c0edffc1",
    },
    {
      key: "tick_lower",
      value: "-88722000",
    },
  ],
}

describe("shared/nft/marketplaces/ekubo", () => {
  describe("isEkuboNft", () => {
    describe("when valid", () => {
      test("returns true", () => {
        expect(isEkuboNft(mockEkuboNft)).toBeTruthy()
      })
    })
    describe("when invalid", () => {
      test("returns false", () => {
        expect(isEkuboNft({ contract_address: "0x123" })).toBeFalsy()
        expect(isEkuboNft({})).toBeFalsy()
      })
    })
  })
})
