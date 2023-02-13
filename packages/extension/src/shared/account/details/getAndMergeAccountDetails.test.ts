import { describe, expect, test } from "vitest"

import { WalletAccount } from "../../wallet.model"
import { AccountTypesFromChain } from "./getAccountTypesFromChain"
import { getAndMergeAccountDetails } from "./getAndMergeAccountDetails"

describe("getAndMergeAccountDetails", () => {
  describe("when valid", () => {
    test("should return the expected account details", () => {
      const address1 =
        "0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25"
      const address2 =
        "0x5417fc252d9b7b6ea311485a9e946cc814e3aa4d00f740f7e5f6b11ce0db9fa"
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
          type: account.address === address1 ? "standard" : "plugin",
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
            "address": "0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
            "guardian": "0x1",
            "networkId": "goerli-alpha",
            "type": "standard",
          },
          {
            "address": "0x5417fc252d9b7b6ea311485a9e946cc814e3aa4d00f740f7e5f6b11ce0db9fa",
            "guardian": "0x2",
            "networkId": "mainnet-alpha",
            "type": "plugin",
          },
        ]
      `)
    })
  })
})
