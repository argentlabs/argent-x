import { describe, expect, test } from "vitest"

import { erc721Transfer } from "../../../ui/features/accountActivity/__test__/__fixtures__/transaction-calls/goerli-alpha"
import {
  Erc721TransferCall,
  parseErc721TransferCall,
} from "../erc721TransferCall"

describe("erc721TransferCall", () => {
  describe("parseErc721TransferCall()", () => {
    describe("when valid", () => {
      test("parses contractAddress, recipientAddress, and amount", () => {
        expect(parseErc721TransferCall(erc721Transfer as Erc721TransferCall))
          .toMatchInlineSnapshot(`
          {
            "contractAddress": "0x03090623ea32d932ca1236595076b00702e7d860696faf300ca9eb13bfe0a78c",
            "fromAddress": "0x05F1f0a38429dcaB9FFD8A786c0d827e84C1CBd8f60243E6d25d066A13aF4a25",
            "toAddress": "0x05417Fc252d9b7B6EA311485a9e946cC814E3AA4D00F740F7e5F6b11Ce0db9fa",
            "tokenId": "4734",
          }
        `)
      })
    })
  })
})
