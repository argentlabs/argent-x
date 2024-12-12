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
import { getRandomAccountIdentifier } from "../../../../utils/accountIdentifier"

const networkId = "sepolia-alpha"

const accountId = getRandomAccountIdentifier("0x123", networkId)

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
              accountId,
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
              accountId,
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
              accountId,
            })),
        ).toMatchInlineSnapshot(`undefined`)
      })
    })
  })
})
