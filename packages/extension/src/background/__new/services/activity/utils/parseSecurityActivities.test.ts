import type { Address } from "@argent/shared"
import { describe, expect, test } from "vitest"

import activities from "../__fixtures__/activities.json"
import activitiesManyEscapes from "../__fixtures__/activities-many-escapes.json"
import activitiesSignerChanged from "../__fixtures__/activities-signer-changed.json"
import state from "../__fixtures__/state.json"
import type { Activity } from "../schema"
import { parseSecurityActivities } from "./parseSecurityActivities"

describe("background/services/activity/utils", () => {
  describe("parseSecurityActivities", () => {
    describe("when valid", () => {
      test("returns a map of actions to account addresses", () => {
        expect(
          parseSecurityActivities({
            activities: activities as Activity[],
            accountAddressesOnNetwork:
              state.accountAddressesOnNetwork as Address[],
          }),
        ).toMatchInlineSnapshot(`
          {
            "guardianChanged": [
              "0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
            ],
          }
        `)
        expect(
          parseSecurityActivities({
            activities: activitiesManyEscapes as Activity[],
            accountAddressesOnNetwork: [
              "0x00c90c89d339d1611f971e9211bc6a8efafc82541a61703a702c17d291afe9bb",
            ] as Address[],
          }),
        ).toMatchInlineSnapshot(`
          {
            "cancelEscape": [
              "0x00c90c89d339d1611f971e9211bc6a8efafc82541a61703a702c17d291afe9bb",
            ],
            "guardianChanged": [
              "0x00c90c89d339d1611f971e9211bc6a8efafc82541a61703a702c17d291afe9bb",
            ],
            "triggerEscapeGuardian": [
              "0x00c90c89d339d1611f971e9211bc6a8efafc82541a61703a702c17d291afe9bb",
            ],
          }
        `)
        expect(
          parseSecurityActivities({
            activities: activitiesSignerChanged as Activity[],
            accountAddressesOnNetwork: [
              "0x02470ea294aa4b28ee4a473aaa8a1edc6c810c11684d1f29f1f3edd336fd0f34",
            ] as Address[],
          }),
        ).toMatchInlineSnapshot(`
          {
            "signerChanged": [
              "0x02470ea294aa4b28ee4a473aaa8a1edc6c810c11684d1f29f1f3edd336fd0f34",
            ],
          }
        `)
      })
    })
  })
})
