import { describe, expect, test } from "vitest"

import type { ArgentWalletAccount } from "../../wallet.model"
import type { AccountClassHashFromChain } from "./getAccountClassHashFromChain"
import { getAndMergeAccountDetails } from "./getAndMergeAccountDetails"
import { getRandomAccountIdentifier } from "../../utils/accountIdentifier"

describe("getAndMergeAccountDetails", () => {
  describe("when valid", () => {
    test("should return the expected account details", async () => {
      const address1 =
        "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a"
      const id1 = getRandomAccountIdentifier(address1)

      const address2 =
        "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79"
      const id2 = getRandomAccountIdentifier(address2, "mainnet-alpha")

      const accounts = [
        {
          id: id1,
          address: address1,
          networkId: "sepolia-alpha",
        },
        {
          id: id2,
          address: address2,
          networkId: "mainnet-alpha",
        },
      ] as ArgentWalletAccount[]
      const getAccountTypesFromChain = async (
        accounts: ArgentWalletAccount[],
      ): Promise<AccountClassHashFromChain[]> => {
        return accounts.map((account) => ({
          ...account,
          type: account.address === address1 ? "standard" : "plugin",
        }))
      }
      const getAccountGuardiansFromChain = async (
        accounts: ArgentWalletAccount[],
      ): Promise<AccountClassHashFromChain[]> => {
        return accounts.map((account) => ({
          ...account,
          guardian: account.address === address1 ? "0x1" : "0x2",
        }))
      }
      await expect(
        getAndMergeAccountDetails(accounts, [
          getAccountTypesFromChain,
          getAccountGuardiansFromChain,
        ]),
      ).resolves.toMatchInlineSnapshot(`
        [
          {
            "address": "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
            "guardian": "0x1",
            "id": "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a::sepolia-alpha::local_secret::0",
            "networkId": "sepolia-alpha",
            "type": "standard",
          },
          {
            "address": "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79",
            "guardian": "0x2",
            "id": "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79::mainnet-alpha::local_secret::0",
            "networkId": "mainnet-alpha",
            "type": "plugin",
          },
        ]
      `)
    })
  })
})
