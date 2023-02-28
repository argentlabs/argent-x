import { describe, expect, test } from "vitest"

import { WalletAccount } from "../../wallet.model"
import { AccountTypesFromChain } from "./getAccountTypesFromChain"
import { getAndMergeAccountDetails } from "./getAndMergeAccountDetails"

describe("getAndMergeAccountDetails", () => {
  describe("when valid", () => {
    test("should return the expected account details", () => {
      const address1 =
        "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a"
      const address2 =
        "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79"
      const accounts = [
        {
          address: address1,
          networkId: "goerli-alpha",
        },
        {
          address: address2,
          networkId: "mainnet-alpha",
        },
      ] as WalletAccount[]
      const getAccountTypesFromChain = async (
        accounts: WalletAccount[],
      ): Promise<AccountTypesFromChain[]> => {
        return accounts.map((account) => ({
          ...account,
          type: account.address === address1 ? "argent" : "argent-plugin",
        }))
      }
      const getAccountGuardiansFromChain = async (
        accounts: WalletAccount[],
      ): Promise<AccountTypesFromChain[]> => {
        return accounts.map((account) => ({
          ...account,
          guardian: account.address === address1 ? "0x1" : "0x2",
        }))
      }
      expect(
        getAndMergeAccountDetails(accounts, [
          getAccountTypesFromChain,
          getAccountGuardiansFromChain,
        ]),
      ).resolves.toMatchInlineSnapshot(`
        [
          {
            "address": "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
            "guardian": "0x1",
            "networkId": "goerli-alpha",
            "type": "argent",
          },
          {
            "address": "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79",
            "guardian": "0x2",
            "networkId": "mainnet-alpha",
            "type": "argent-plugin",
          },
        ]
      `)
    })
  })
})
