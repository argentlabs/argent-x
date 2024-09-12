import { describe, expect, test } from "vitest"

import {
  erc1155Transfer,
  erc721Transfer,
} from "./__fixtures__/transaction-calls/sepolia-alpha"
import { NftTransferCall, parseNftTransferCall } from "./nftTransferCall"

describe("nftTransferCall", () => {
  describe("parseNftTransferCall()", () => {
    describe("when valid", () => {
      test("parses contractAddress, recipientAddress, and amount", () => {
        expect(parseNftTransferCall(erc721Transfer as NftTransferCall))
          .toMatchInlineSnapshot(`
          {
            "contractAddress": "0x03090623ea32d932ca1236595076b00702e7d860696faf300ca9eb13bfe0a78c",
            "fromAddress": "0x05F1f0a38429dcaB9FFD8A786c0d827e84C1CBd8f60243E6d25d066A13aF4a25",
            "toAddress": "0x05417Fc252d9b7B6EA311485a9e946cC814E3AA4D00F740F7e5F6b11Ce0db9fa",
            "tokenId": "4734",
          }
        `)
      })

      test("parses contractAddress, recipientAddress, and amount", () => {
        expect(parseNftTransferCall(erc1155Transfer as NftTransferCall))
          .toMatchInlineSnapshot(`
            {
              "contractAddress": "0x01e1f972637ad02e0eed03b69304344c4253804e528e1a5dd5c26bb2f23a8139",
              "fromAddress": "0x05F1f0a38429dcaB9FFD8A786c0d827e84C1CBd8f60243E6d25d066A13aF4a25",
              "toAddress": "0x05417Fc252d9b7B6EA311485a9e946cC814E3AA4D00F740F7e5F6b11Ce0db9fa",
              "tokenId": "4734",
            }
          `)
      })
    })
  })
})
