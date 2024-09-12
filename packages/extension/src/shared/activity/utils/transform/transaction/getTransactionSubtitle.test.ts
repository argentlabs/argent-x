import { describe, expect, test } from "vitest"

import { nftContractAddresses } from "../__fixtures__/nftContractAddresses"
import { tokensByNetwork } from "../__fixtures__/tokensByNetwork"
import { transformTransaction } from "./transformTransaction"
import {
  erc20SwapAlphaRoad,
  erc20Transfer,
} from "../../../../call/__fixtures__/transaction-calls/sepolia-alpha"
import { makeTransaction, accountAddress } from "./transformTransaction.test"
import { getTransactionSubtitle } from "./getTransactionSubtitle"

const networkId = "sepolia-alpha"

describe("getTransactionSubtitle", () => {
  describe("when valid", () => {
    describe("and the address is known", () => {
      test("should return the to address", async () => {
        const transactionTransformed = transformTransaction({
          transaction: makeTransaction(erc20Transfer),
          accountAddress,
          tokensByNetwork,
          nftContractAddresses,
        })
        expect(
          transactionTransformed &&
            (await getTransactionSubtitle({
              transactionTransformed,
              networkId,
            })),
        ).toMatchInlineSnapshot(`"To: 0x0541…b9fa"`)
      })
      test("should return the address name", async () => {
        const transactionTransformed = transformTransaction({
          transaction: makeTransaction(erc20Transfer),
          accountAddress,
          tokensByNetwork,
          nftContractAddresses,
        })
        expect(
          transactionTransformed &&
            (await getTransactionSubtitle({
              transactionTransformed,
              networkId,
              getAddressName: () => "Foo bar",
            })),
        ).toMatchInlineSnapshot(`"To: Foo bar"`)
      })
      test("should return the dapp name", async () => {
        const transactionTransformed = transformTransaction({
          transaction: makeTransaction(erc20SwapAlphaRoad),
          accountAddress,
          tokensByNetwork,
          nftContractAddresses,
        })
        expect(
          transactionTransformed &&
            (await getTransactionSubtitle({
              transactionTransformed,
              networkId,
            })),
        ).toMatchInlineSnapshot(`"Alpha Road"`)
      })
    })
  })
})
