import type { Address } from "@argent/x-shared"
import { describe, expect, test } from "vitest"

import type { Activity } from "../schema"
import { parseFinanceActivities } from "./parseFinanceActivities"

import activities from "../__fixtures__/activities.json"
import depositActivities from "../__fixtures__/activities-handle-deposit.json"
import state from "../__fixtures__/state.json"

describe("background/services/activity/utils", () => {
  describe("parseSecurityActivities", () => {
    describe("when valid", () => {
      test("returns a map of actions to account addresses", () => {
        expect(
          parseFinanceActivities({
            activities: activities as Activity[],
            accountAddressesOnNetwork:
              state.accountAddressesOnNetwork as Address[],
            tokenAddressesOnNetwork: state.tokenAddressesOnNetwork as Address[],
            nftAddressesOnNetwork: state.nftAddressesOnNetwork as Address[],
          }),
        ).toMatchInlineSnapshot(`
          {
            "nftActivity": {
              "accountAddresses": [
                "0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
                "0x00a00018122f54123d4003db254cd2054679d92eeefaa7c2d94c27abb9143b35",
              ],
              "tokenAddresses": [
                "0x031f9085c75917a4860da8628ffc3b4d4587da88dc2ee664516a9271a94cf266",
              ],
            },
            "tokenActivity": {
              "accountAddresses": [
                "0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
                "0x025a2751133d109a5c876c87d9fd29d04c9d1f28de6790831c068f4c2fbc565e",
                "0x03d98fe1fecdd2020fce7869b5451f6395fb942789459752a8a4ea55a578345d",
                "0x039b90d5c8fbf32641bd117664952b10905f421792cf04b584517c2c430f7b5e",
                "0x01cf2a3112c54821398a8544736108b8491a72dfd9d0687759037bc0792097ec",
                "0x05eabc4165024d9e3da1be66688bfe70f1d8d8b234844ff9463172505df2dae8",
                "0x00a00018122f54123d4003db254cd2054679d92eeefaa7c2d94c27abb9143b35",
              ],
              "tokenAddresses": [
                "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
              ],
            },
          }
        `)
      })
      test("returns a map of actions to account addresses for deposit activity", () => {
        expect(
          parseFinanceActivities({
            activities: depositActivities as Activity[],
            accountAddressesOnNetwork:
              state.accountAddressesOnNetwork as Address[],
            tokenAddressesOnNetwork: state.tokenAddressesOnNetwork as Address[],
            nftAddressesOnNetwork: state.nftAddressesOnNetwork as Address[],
          }),
        ).toMatchInlineSnapshot(`
          {
            "nftActivity": {
              "accountAddresses": [],
              "tokenAddresses": [],
            },
            "tokenActivity": {
              "accountAddresses": [],
              "tokenAddresses": [
                "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
              ],
            },
          }
        `)
      })
    })
  })
})
