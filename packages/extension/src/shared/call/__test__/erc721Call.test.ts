import { describe, expect, test } from "vitest"

import {
  erc721MintAspect,
  erc721Transfer,
} from "../../../ui/features/accountActivity/__test__/__fixtures__/transaction-calls/goerli-alpha"
import { Erc721Call, parseErc721Call } from "../erc721Call"

describe("erc20transferCall", () => {
  describe("parseErc721Call()", () => {
    describe("when valid", () => {
      test("parses contractAddress, recipientAddress, and amount", () => {
        expect(
          parseErc721Call(erc721Transfer as Erc721Call),
        ).toMatchInlineSnapshot(`
          {
            "contractAddress": "0x0266b1276d23ffb53d99da3f01be7e29fa024dd33cd7f7b1eb7a46c67891c9d0",
            "recipientAddress1": "0x05F1f0a38429dcaB9FFD8A786c0d827e84C1CBd8f60243E6d25d066A13aF4a25",
            "recipientAddress2": "0x05417Fc252d9b7B6EA311485a9e946cC814E3AA4D00F740F7e5F6b11Ce0db9fa",
            "tokenId": "0671be1c7cf19612cf3a1c1381a6dd3f24f03c90036b9fd52000000000000000",
          }
        `)
      })
      test("parses contractAddress, recipientAddress, and amount", () => {
        expect(
          parseErc721Call(erc721MintAspect as Erc721Call),
        ).toMatchInlineSnapshot(`
          {
            "contractAddress": "0x03090623ea32d932ca1236595076b00702e7d860696faf300ca9eb13bfe0a78c",
            "recipientAddress1": "0x05F1f0a38429dcaB9FFD8A786c0d827e84C1CBd8f60243E6d25d066A13aF4a25",
            "recipientAddress2": "0x0000000000000000000000000000000000000000000000000000000000000002",
            "tokenId": "5538653231694dabddcfda88829fb7d1d1b8d4c19b7467684454746d3362566570617a503243",
          }
        `)
      })
    })
  })
})
